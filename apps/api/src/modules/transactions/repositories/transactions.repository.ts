import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { Prisma, TransactionType } from "@finai/database";
import type { TransactionFilterInput } from "@finai/validation";
import { assertOwnedReferences, applyTransactionImpact, type OwnedReferenceRefs } from "../utils";
import { resolveWorkspaceMemberIds } from "@/common/utils/workspace.util";

@Injectable()
export class TransactionsRepository {
  private readonly logger = new Logger(TransactionsRepository.name);
  constructor(private prisma: PrismaService) {}

  /** Build the shared Prisma `where` clause from filter inputs and workspace members. */
  private buildWhere(
    userId: string,
    filter: TransactionFilterInput,
    workspaceId?: string,
    memberUserIds?: string[],
  ): Prisma.TransactionWhereInput {
    const targetUserIds = memberUserIds && memberUserIds.length > 0 ? memberUserIds : [userId];
    const where: Prisma.TransactionWhereInput = workspaceId
      ? {
          OR: [{ workspaceId }, { userId: { in: targetUserIds } }],
        }
      : { userId };
    if (filter.search) where.notes = { contains: filter.search, mode: "insensitive" };
    if (filter.category) where.categoryId = filter.category;
    if (filter.account) where.accountId = filter.account;
    if (filter.type) where.type = filter.type as TransactionType;
    if (filter.dateFrom || filter.dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filter.dateFrom) dateFilter.gte = new Date(filter.dateFrom);
      if (filter.dateTo) dateFilter.lte = new Date(filter.dateTo);
      where.date = dateFilter;
    }
    return where;
  }

  /** Returns paginated transactions with full relations for all members of the workspace. */
  async findAll(
    userId: string,
    filter: TransactionFilterInput,
    workspaceId?: string,
    memberUserIds?: string[],
  ) {
    this.logger.info(
      `[findAll] Listing transactions for user ${userId.slice(0, 8)}, page: ${filter.page ?? 1}`,
    );
    const resolvedMemberIds =
      memberUserIds ?? (await resolveWorkspaceMemberIds(this.prisma.client, workspaceId, userId));
    const where = this.buildWhere(userId, filter, workspaceId, resolvedMemberIds);
    const page = filter.page ?? 1;
    const limit = filter.pageSize ?? 50;
    const [items, total] = await Promise.all([
      this.prisma.client.transaction.findMany({
        where,
        include: {
          category: true,
          account: { select: { id: true, name: true, type: true } },
          toAccount: { select: { id: true, name: true, type: true } },
          investment: { select: { id: true, name: true, assetClass: true } },
          goal: { select: { id: true, name: true, targetAmount: true } },
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.transaction.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Fetches a single transaction by ID scoped to the user or workspace. */
  async findOne(id: string, userId: string, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(
      `[findOne] Fetching transaction ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const resolvedMemberIds =
      memberUserIds ?? (await resolveWorkspaceMemberIds(this.prisma.client, workspaceId, userId));
    const where: Prisma.TransactionWhereInput = {
      id,
      ...(workspaceId
        ? {
            OR: [{ workspaceId }, { userId: { in: resolvedMemberIds } }],
          }
        : { userId }),
    };
    const tx = await this.prisma.client.transaction.findFirst({
      where,
      include: {
        category: true,
        account: true,
        toAccount: true,
        investment: true,
        goal: true,
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
    if (!tx) {
      this.logger.warn(
        `[findOne] Transaction ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return tx;
  }

  /** Returns minimal transaction fields for re-categorization matching. */
  async findForRecategorize(userId: string, filter: TransactionFilterInput) {
    const where = this.buildWhere(userId, filter);
    return this.prisma.client.transaction.findMany({ where, select: { id: true } });
  }

  /** Applies a bulk category update for a list of transaction IDs. */
  async updateCategoryBulk(ids: string[], categoryId: string) {
    return this.prisma.client.transaction.updateMany({
      where: { id: { in: ids } },
      data: { categoryId },
    });
  }

  /** Summarizes transaction amounts grouped by type. */
  async groupByType(
    userId: string,
    dateFrom: Date,
    dateTo: Date,
    type?: TransactionType,
    memberUserIds?: string[],
  ) {
    const userScope = memberUserIds && memberUserIds.length > 0 ? { in: memberUserIds } : userId;
    return this.prisma.client.transaction.groupBy({
      by: ["type"],
      where: { userId: userScope, date: { gte: dateFrom, lte: dateTo }, ...(type && { type }) },
      _sum: { amount: true },
    });
  }

  /** Summarizes transaction amounts grouped by categoryId. */
  async groupByCategory(
    userId: string,
    dateFrom: Date,
    dateTo: Date,
    type?: TransactionType,
    memberUserIds?: string[],
  ) {
    const userScope = memberUserIds && memberUserIds.length > 0 ? { in: memberUserIds } : userId;
    return this.prisma.client.transaction.groupBy({
      by: ["categoryId"],
      where: { userId: userScope, date: { gte: dateFrom, lte: dateTo }, ...(type && { type }) },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  }

  /** Validates that referenced entities exist and are owned by the user. */
  async assertOwnedRefs(userId: string, refs: OwnedReferenceRefs) {
    await assertOwnedReferences(this.prisma.client, userId, refs);
    this.logger.info(`[assertOwnedRefs] All refs valid for user ${userId.slice(0, 8)}`);
  }

  /** Applies balance/investment/goal changes inside an active Prisma transaction. */
  async applyImpact(
    txClient: Prisma.TransactionClient,
    type: TransactionType,
    amount: number,
    accountId?: string | null,
    toAccountId?: string | null,
    investmentId?: string | null,
    goalId?: string | null,
    multiplier = 1,
  ) {
    await applyTransactionImpact(
      txClient,
      type,
      amount,
      { accountId, toAccountId, investmentId, goalId },
      multiplier,
    );
  }
}

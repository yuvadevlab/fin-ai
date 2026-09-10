import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { Prisma, TransactionType } from "@finai/database";
import type { TransactionFilterInput } from "@finai/validation";
import { getTransactionImpact } from "../utils";

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  /** Build the shared Prisma `where` clause from filter inputs. */
  private buildWhere(userId: string, filter: TransactionFilterInput): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = { userId };
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

  /** Returns paginated transactions with full relations. */
  async findAll(userId: string, filter: TransactionFilterInput) {
    const where = this.buildWhere(userId, filter);
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
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.transaction.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Fetches a single transaction by ID scoped to the user. */
  async findOne(id: string, userId: string) {
    const tx = await this.prisma.client.transaction.findFirst({
      where: { id, userId },
      include: { category: true, account: true, toAccount: true, investment: true, goal: true },
    });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
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
  async groupByType(userId: string, dateFrom: Date, dateTo: Date, type?: TransactionType) {
    return this.prisma.client.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { gte: dateFrom, lte: dateTo }, ...(type && { type }) },
      _sum: { amount: true },
    });
  }

  /** Summarizes transaction amounts grouped by categoryId. */
  async groupByCategory(userId: string, dateFrom: Date, dateTo: Date, type?: TransactionType) {
    return this.prisma.client.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, date: { gte: dateFrom, lte: dateTo }, ...(type && { type }) },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  }

  /** Validates that referenced entities exist and are owned by the user. */
  async assertOwnedRefs(
    userId: string,
    refs: {
      accountId?: string | null;
      toAccountId?: string | null;
      categoryId?: string | null;
      investmentId?: string | null;
      goalId?: string | null;
    },
  ) {
    const missing: string[] = [];
    if (refs.accountId) {
      const a = await this.prisma.client.account.findFirst({
        where: { id: refs.accountId, userId, isActive: true },
        select: { id: true },
      });
      if (!a) missing.push(`account ${refs.accountId}`);
    }
    if (refs.toAccountId) {
      const a = await this.prisma.client.account.findFirst({
        where: { id: refs.toAccountId, userId, isActive: true },
        select: { id: true },
      });
      if (!a) missing.push(`destination account ${refs.toAccountId}`);
    }
    if (refs.categoryId) {
      const c = await this.prisma.client.category.findFirst({
        where: { id: refs.categoryId, userId },
        select: { id: true },
      });
      if (!c) missing.push(`category ${refs.categoryId}`);
    }
    if (refs.investmentId) {
      const i = await this.prisma.client.investment.findFirst({
        where: { id: refs.investmentId, userId },
        select: { id: true },
      });
      if (!i) missing.push(`investment ${refs.investmentId}`);
    }
    if (refs.goalId) {
      const g = await this.prisma.client.goal.findFirst({
        where: { id: refs.goalId, userId },
        select: { id: true },
      });
      if (!g) missing.push(`goal ${refs.goalId}`);
    }
    if (missing.length > 0) {
      throw new BadRequestException(
        `Cannot record transaction: ${missing.join(", ")} not found for this user`,
      );
    }
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
    multiplier: number = 1,
  ) {
    const { accountChange, toAccountChange } = getTransactionImpact(type, amount);

    if (accountId && accountChange !== 0) {
      await txClient.account.update({
        where: { id: accountId },
        data: { balance: { increment: accountChange * multiplier } },
      });
    }
    if (toAccountId && toAccountChange !== 0) {
      await txClient.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: toAccountChange * multiplier } },
      });
    }
    if (type === TransactionType.INVESTMENT && investmentId) {
      await txClient.investment.update({
        where: { id: investmentId },
        data: {
          investedAmount: { increment: amount * multiplier },
          currentValue: { increment: amount * multiplier },
        },
      });
    }
    if (type === TransactionType.GOAL && goalId) {
      await txClient.goal.update({
        where: { id: goalId },
        data: { currentAmount: { increment: amount * multiplier } },
      });
    }
  }
}

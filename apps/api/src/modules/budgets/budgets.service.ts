import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateBudgetInput, UpdateBudgetInput } from "@finai/validation";
import { calculateBudgetStatus } from "@finai/finance-engine";
import { Prisma, TransactionType } from "@finai/database";
import { transferBudgetAllocation } from "./budgets-transfer.util";
import { resolveWorkspaceMemberIds } from "@/common/utils/workspace.util";

/**
 * Budget management service.
 *
 * Budgets are category-scoped spending limits. Each budget tracks spending
 * against its category from a configurable start date (defaults to the 1st of
 * the current month). Spending is aggregated from EXPENSE transactions only —
 * income transactions do not count against a budget.
 */
@Injectable()
export class BudgetsService {
  private readonly logger = new Logger(BudgetsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Lists all budgets for a user with their current spending and status.
   *
   * For each budget, sums up all EXPENSE transactions in the budget's period
   * (from startDate to now) and computes an at-a-glance status (under/on/over
   * budget) using the pure `calculateBudgetStatus` helper from finance-engine.
   */
  async findAll(userId: string, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(`[findAll] Listing budgets for user ${userId.slice(0, 8)}`);
    const resolvedMemberIds =
      memberUserIds ?? (await resolveWorkspaceMemberIds(this.prisma.client, workspaceId, userId));
    const where: Prisma.BudgetWhereInput = workspaceId
      ? {
          OR: [{ workspaceId }, { userId: { in: resolvedMemberIds } }],
        }
      : { userId };

    const budgets = await this.prisma.client.budget.findMany({
      where,
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        if (budget.startDate && budget.startDate > endOfMonth) {
          return { ...budget, spent: 0, status: calculateBudgetStatus(0, budget.limit) };
        }

        const txWhere: Prisma.TransactionWhereInput = {
          categoryId: budget.categoryId,
          type: TransactionType.EXPENSE,
          date: { gte: startOfMonth, lte: endOfMonth },
          ...(workspaceId
            ? {
                OR: [{ workspaceId }, { userId: { in: resolvedMemberIds } }],
              }
            : { userId }),
        };

        const agg = await this.prisma.client.transaction.aggregate({
          where: txWhere,
          _sum: { amount: true },
        });

        const spent = agg._sum.amount ?? 0;
        const status = calculateBudgetStatus(spent, budget.limit);
        return { ...budget, spent, status };
      }),
    );

    this.logger.info(`Found ${enriched.length} budget(s) for user ${userId.slice(0, 8)}`);
    return enriched;
  }

  /** Finds a single budget by ID, scoped to the user or workspace. Throws if not found. */
  async findOne(id: string, userId: string, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(
      `[findOne] Looking up budget ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const resolvedMemberIds =
      memberUserIds ?? (await resolveWorkspaceMemberIds(this.prisma.client, workspaceId, userId));
    const where: Prisma.BudgetWhereInput = {
      id,
      ...(workspaceId
        ? {
            OR: [{ workspaceId }, { userId: { in: resolvedMemberIds } }],
          }
        : { userId }),
    };

    const budget = await this.prisma.client.budget.findFirst({
      where,
      include: { category: true },
    });
    if (!budget) {
      this.logger.warn(
        `[findOne] Budget ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException(`Budget ${id} not found`);
    }
    return budget;
  }

  /** Creates a new budget for a user. The startDate defaults to now if omitted. */
  async create(userId: string, input: CreateBudgetInput, workspaceId?: string) {
    this.logger.info(
      `[create] Creating budget for category ${input.categoryId.slice(0, 8)}, limit: ${input.limit}`,
    );
    const budget = await this.prisma.client.budget.create({
      data: {
        userId,
        ...(workspaceId && { workspaceId }),
        categoryId: input.categoryId,
        limit: input.limit,
        startDate: input.startDate
          ? new Date(input.startDate)
          : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
      include: { category: true },
    });
    this.logger.info(`[create] Budget created: ${budget.id.slice(0, 8)}`);
    return budget;
  }

  /**
   * Updates a budget. Currently only the spending limit can be changed —
   * category and startDate are immutable after creation (the update schema
   * enforces this at the validation layer).
   */
  async update(id: string, userId: string, input: UpdateBudgetInput, workspaceId?: string) {
    await this.findOne(id, userId, workspaceId);
    this.logger.info(`[update] Updating budget ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    const updated = await this.prisma.client.budget.update({
      where: { id },
      data: {
        ...(input.limit !== undefined && { limit: input.limit }),
      },
      include: { category: true },
    });
    return updated;
  }

  /** Deletes a budget. The budget must belong to the user (enforced by findOne). */
  async remove(id: string, userId: string, workspaceId?: string) {
    await this.findOne(id, userId, workspaceId);
    this.logger.info(`[remove] Deleting budget ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    await this.prisma.client.budget.delete({ where: { id } });
    return { deleted: true };
  }

  /**
   * Composite: move part of one budget's limit to another budget atomically.
   * Both budgets must belong to the user; the source limit cannot drop below
   * zero. Returns the updated target budget.
   */
  async transferAllocation(
    userId: string,
    fromBudgetId: string,
    toBudgetId: string,
    amount: number,
  ) {
    return transferBudgetAllocation(this.prisma, userId, fromBudgetId, toBudgetId, amount);
  }
}

import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Logger } from "@finai/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateBudgetInput, UpdateBudgetInput } from "@finai/validation";
import { calculateBudgetStatus } from "@finai/finance-engine";
import { TransactionType } from "@finai/database";

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
  async findAll(userId: string) {
    this.logger.debug(`[findAll] Listing all budgets for user ${userId.slice(0, 8)}`);
    const budgets = await this.prisma.client.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const agg = await this.prisma.client.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: TransactionType.EXPENSE,
            date: {
              gte: budget.startDate ?? startOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spent = agg._sum.amount ?? 0;
        const status = calculateBudgetStatus(spent, budget.limit);
        return { ...budget, spent, status };
      }),
    );

    this.logger.info(
      `Found ${enriched.length} budget(s) for user ${userId.slice(0, 8)}, total spent: ${enriched.reduce((s, b) => s + b.spent, 0)}`,
    );
    return enriched;
  }

  /** Finds a single budget by ID, scoped to the user. Throws if not found. */
  async findOne(id: string, userId: string) {
    this.logger.debug(
      `[findOne] Looking up budget ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const budget = await this.prisma.client.budget.findFirst({
      where: { id, userId },
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
  async create(userId: string, input: CreateBudgetInput) {
    this.logger.info(
      `[create] Creating budget for category ${input.categoryId.slice(0, 8)}, limit: ${input.limit} for user ${userId.slice(0, 8)}`,
    );
    const budget = await this.prisma.client.budget.create({
      data: {
        userId,
        categoryId: input.categoryId,
        limit: input.limit,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
      },
      include: { category: true },
    });
    this.logger.info(
      `[create] Budget created: ${budget.id.slice(0, 8)} — ${budget.category?.name} limit ${budget.limit} for user ${userId.slice(0, 8)}`,
    );
    return budget;
  }

  /**
   * Updates a budget. Currently only the spending limit can be changed —
   * category and startDate are immutable after creation (the update schema
   * enforces this at the validation layer).
   */
  async update(id: string, userId: string, input: UpdateBudgetInput) {
    await this.findOne(id, userId);
    this.logger.info(`[update] Updating budget ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    const updated = await this.prisma.client.budget.update({
      where: { id },
      data: {
        ...(input.limit !== undefined && { limit: input.limit }),
      },
      include: { category: true },
    });
    this.logger.info(
      `[update] Budget ${id.slice(0, 8)} updated — new limit: ${updated.limit} (user: ${userId.slice(0, 8)})`,
    );
    return updated;
  }

  /** Deletes a budget. The budget must belong to the user (enforced by findOne). */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    this.logger.info(`[remove] Deleting budget ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    await this.prisma.client.budget.delete({ where: { id } });
    this.logger.info(`[remove] Budget ${id.slice(0, 8)} deleted (user: ${userId.slice(0, 8)})`);
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
    this.logger.info(
      `[transferAllocation] Transferring ${amount} from ${fromBudgetId.slice(0, 8)} to ${toBudgetId.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    if (fromBudgetId === toBudgetId) {
      this.logger.warn(
        `[transferAllocation] Source and target budgets are the same: ${fromBudgetId.slice(0, 8)}`,
      );
      throw new BadRequestException("Source and target budgets must be different");
    }
    if (amount <= 0) {
      this.logger.warn(`[transferAllocation] Invalid transfer amount: ${amount}`);
      throw new BadRequestException("Transfer amount must be positive");
    }

    return this.prisma.client.$transaction(async (tx) => {
      const [fromBudget, toBudget] = await Promise.all([
        tx.budget.findFirst({ where: { id: fromBudgetId, userId } }),
        tx.budget.findFirst({ where: { id: toBudgetId, userId } }),
      ]);
      if (!fromBudget) {
        this.logger.warn(
          `[transferAllocation] Source budget ${fromBudgetId.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
        );
        throw new NotFoundException(`Budget ${fromBudgetId} not found`);
      }
      if (!toBudget) {
        this.logger.warn(
          `[transferAllocation] Target budget ${toBudgetId.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
        );
        throw new NotFoundException(`Budget ${toBudgetId} not found`);
      }
      if (fromBudget.limit - amount < 0) {
        this.logger.warn(
          `[transferAllocation] Insufficient funds in source budget ${fromBudgetId.slice(0, 8)}: limit ${fromBudget.limit}, transfer ${amount}`,
        );
        throw new BadRequestException("Transfer amount exceeds the source budget limit");
      }

      await tx.budget.update({
        where: { id: fromBudget.id },
        data: { limit: { decrement: amount } },
      });
      const result = await tx.budget.update({
        where: { id: toBudget.id },
        data: { limit: { increment: amount } },
        include: { category: true },
      });
      this.logger.info(
        `[transferAllocation] Transferred ${amount} from ${fromBudgetId.slice(0, 8)} to ${toBudgetId.slice(0, 8)} — new source limit: ${fromBudget.limit - amount}, new target limit: ${result.limit} (user: ${userId.slice(0, 8)})`,
      );
      return result;
    });
  }
}

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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
  constructor(private prisma: PrismaService) {}

  /**
   * Lists all budgets for a user with their current spending and status.
   *
   * For each budget, sums up all EXPENSE transactions in the budget's period
   * (from startDate to now) and computes an at-a-glance status (under/on/over
   * budget) using the pure `calculateBudgetStatus` helper from finance-engine.
   */
  async findAll(userId: string) {
    const budgets = await this.prisma.client.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return Promise.all(
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
  }

  /** Finds a single budget by ID, scoped to the user. Throws if not found. */
  async findOne(id: string, userId: string) {
    const budget = await this.prisma.client.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!budget) throw new NotFoundException(`Budget ${id} not found`);
    return budget;
  }

  /** Creates a new budget for a user. The startDate defaults to now if omitted. */
  async create(userId: string, input: CreateBudgetInput) {
    return this.prisma.client.budget.create({
      data: {
        userId,
        categoryId: input.categoryId,
        limit: input.limit,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
      },
      include: { category: true },
    });
  }

  /**
   * Updates a budget. Currently only the spending limit can be changed —
   * category and startDate are immutable after creation (the update schema
   * enforces this at the validation layer).
   */
  async update(id: string, userId: string, input: UpdateBudgetInput) {
    await this.findOne(id, userId);
    return this.prisma.client.budget.update({
      where: { id },
      data: {
        ...(input.limit !== undefined && { limit: input.limit }),
      },
      include: { category: true },
    });
  }

  /** Deletes a budget. The budget must belong to the user (enforced by findOne). */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
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
    if (fromBudgetId === toBudgetId) {
      throw new BadRequestException("Source and target budgets must be different");
    }
    if (amount <= 0) {
      throw new BadRequestException("Transfer amount must be positive");
    }

    return this.prisma.client.$transaction(async (tx) => {
      const [fromBudget, toBudget] = await Promise.all([
        tx.budget.findFirst({ where: { id: fromBudgetId, userId } }),
        tx.budget.findFirst({ where: { id: toBudgetId, userId } }),
      ]);
      if (!fromBudget) throw new NotFoundException(`Budget ${fromBudgetId} not found`);
      if (!toBudget) throw new NotFoundException(`Budget ${toBudgetId} not found`);
      if (fromBudget.limit - amount < 0) {
        throw new BadRequestException("Transfer amount exceeds the source budget limit");
      }

      await tx.budget.update({
        where: { id: fromBudget.id },
        data: { limit: { decrement: amount } },
      });
      return tx.budget.update({
        where: { id: toBudget.id },
        data: { limit: { increment: amount } },
        include: { category: true },
      });
    });
  }
}

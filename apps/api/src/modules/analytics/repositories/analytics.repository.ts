import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { TransactionType } from "@finai/database";

@Injectable()
export class AnalyticsRepository {
  constructor(private prisma: PrismaService) {}

  /** Fetch active account balances. */
  async getAccountBalances(userId: string) {
    return this.prisma.client.account.findMany({
      where: { userId, isActive: true },
      select: { balance: true },
    });
  }

  /** Fetch transactions in a date range with minimal fields. */
  async getTransactionsInRange(
    userId: string,
    from: Date,
    to?: Date,
    extraWhere?: Partial<{ type: TransactionType }>,
  ) {
    return this.prisma.client.transaction.findMany({
      where: {
        userId,
        date: { gte: from, ...(to && { lte: to }) },
        ...extraWhere,
      },
      select: { amount: true, date: true, type: true },
    });
  }

  /** Fetch all goal IDs for counting. */
  async getGoalCount(userId: string) {
    return this.prisma.client.goal.findMany({ where: { userId }, select: { id: true } });
  }

  /** Fetch investment current values. */
  async getInvestmentValues(userId: string) {
    return this.prisma.client.investment.findMany({
      where: { userId },
      select: { currentValue: true },
    });
  }

  /** Fetch goals with amounts and type. */
  async getGoals(userId: string) {
    return this.prisma.client.goal.findMany({
      where: { userId },
      select: { currentAmount: true, targetAmount: true, type: true },
    });
  }

  /** Fetch budgets with category spend aggregate for the current month. */
  async getBudgetsWithSpend(userId: string, startOfMonth: Date) {
    const budgets = await this.prisma.client.budget.findMany({
      where: { userId },
      include: { category: { select: { id: true } } },
    });

    const budgetSpend = await Promise.all(
      budgets.map((b) =>
        this.prisma.client.transaction.aggregate({
          where: {
            userId,
            categoryId: b.categoryId,
            type: TransactionType.EXPENSE,
            date: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
      ),
    );

    return budgets.map((b, i) => ({
      ...b,
      spent: budgetSpend[i]._sum.amount ?? 0,
    }));
  }

  /** Fetch goals for recommendations (full details). */
  async getGoalsForRecommendations(userId: string) {
    return this.prisma.client.goal.findMany({ where: { userId } });
  }

  /** Fetch investments for asset allocation. */
  async getInvestmentsForAllocation(userId: string) {
    return this.prisma.client.investment.findMany({
      where: { userId },
      select: { name: true, currentValue: true },
    });
  }

  /** Fetch category expense breakdown grouped by categoryId. */
  async getCategoryExpenseGrouped(userId: string, startOfMonth: Date) {
    return this.prisma.client.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, date: { gte: startOfMonth }, type: TransactionType.EXPENSE },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "asc" } },
    });
  }

  /** Fetch category names for a list of IDs. */
  async getCategoriesByIds(ids: string[]) {
    return this.prisma.client.category.findMany({ where: { id: { in: ids } } });
  }

  /** Fetch budgets with category name and per-category spend. */
  async getBudgetsWithCategorySpend(userId: string, startOfMonth: Date) {
    const budgets = await this.prisma.client.budget.findMany({
      where: { userId },
      include: { category: { select: { name: true } } },
    });

    const spend = await Promise.all(
      budgets.map((b) =>
        this.prisma.client.transaction.aggregate({
          where: {
            userId,
            categoryId: b.categoryId,
            type: TransactionType.EXPENSE,
            date: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
      ),
    );

    return budgets.map((b, i) => ({
      name: b.category?.name ?? "Category",
      spent: spend[i]._sum.amount ?? 0,
      limit: b.limit,
    }));
  }

  /** Fetch safe-to-spend data: balances, month transactions, budgets, goals. */
  async getSafeToSpendData(userId: string, startOfMonth: Date) {
    return Promise.all([
      this.prisma.client.account.findMany({
        where: { userId, isActive: true },
        select: { balance: true },
      }),
      this.prisma.client.transaction.findMany({
        where: { userId, date: { gte: startOfMonth } },
        select: { amount: true, type: true },
      }),
      this.prisma.client.budget.findMany({
        where: { userId, categoryId: { not: null } },
        select: { categoryId: true, limit: true },
      }),
      this.prisma.client.goal.findMany({
        where: { userId, deadline: { not: null } },
        select: { targetAmount: true, currentAmount: true, deadline: true },
      }),
    ]);
  }

  /** Fetch investments with asset class for diversification. */
  async getInvestmentsWithAssetClass(userId: string) {
    return this.prisma.client.investment.findMany({
      where: { userId },
      select: { currentValue: true, assetClass: true },
    });
  }
}

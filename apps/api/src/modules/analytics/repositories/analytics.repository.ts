import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { TransactionType } from "@finai/database";
import { resolveWorkspaceMemberIds } from "@/common/utils/workspace.util";

@Injectable()
export class AnalyticsRepository {
  private readonly logger = new Logger(AnalyticsRepository.name);
  constructor(private prisma: PrismaService) {}

  async resolveTargetIds(
    userId: string,
    workspaceId?: string,
    memberUserIds?: string[],
  ): Promise<string[]> {
    if (memberUserIds && memberUserIds.length > 0) return memberUserIds;
    return resolveWorkspaceMemberIds(this.prisma.client, workspaceId, userId);
  }

  async getAccountBalances(userIds: string[]) {
    this.logger.info(`[getAccountBalances] Fetching balances for ${userIds.length} user(s)`);
    return this.prisma.client.account.findMany({
      where: { userId: { in: userIds }, isActive: true },
      select: { balance: true },
    });
  }

  async getTransactionsInRange(
    userIds: string[],
    from: Date,
    to?: Date,
    extraWhere?: Partial<{ type: TransactionType }>,
  ) {
    this.logger.info(`[getTransactionsInRange] Fetching txns for ${userIds.length} user(s)`);
    return this.prisma.client.transaction.findMany({
      where: {
        userId: { in: userIds },
        date: { gte: from, ...(to && { lte: to }) },
        ...extraWhere,
      },
      select: { amount: true, date: true, type: true },
    });
  }

  async getGoalCount(userIds: string[]) {
    this.logger.info(`[getGoalCount] Counting goals for ${userIds.length} user(s)`);
    return this.prisma.client.goal.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
  }

  async getInvestmentValues(userIds: string[]) {
    this.logger.info(`[getInvestmentValues] Fetching investments for ${userIds.length} user(s)`);
    return this.prisma.client.investment.findMany({
      where: { userId: { in: userIds } },
      select: { currentValue: true },
    });
  }

  async getGoals(userIds: string[]) {
    this.logger.info(`[getGoals] Fetching goals for ${userIds.length} user(s)`);
    return this.prisma.client.goal.findMany({
      where: { userId: { in: userIds } },
      select: { currentAmount: true, targetAmount: true, type: true },
    });
  }

  async getBudgetsWithSpend(userIds: string[], startOfMonth: Date) {
    this.logger.info(
      `[getBudgetsWithSpend] Fetching budgets + spend for ${userIds.length} user(s)`,
    );
    const budgets = await this.prisma.client.budget.findMany({
      where: { userId: { in: userIds } },
      include: { category: { select: { id: true } } },
    });

    const budgetSpend = await Promise.all(
      budgets.map((b) =>
        this.prisma.client.transaction.aggregate({
          where: {
            userId: { in: userIds },
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

  async getGoalsForRecommendations(userIds: string[]) {
    this.logger.info(`[getGoalsForRecommendations] Fetching goals for ${userIds.length} user(s)`);
    return this.prisma.client.goal.findMany({ where: { userId: { in: userIds } } });
  }

  async getInvestmentsForAllocation(userIds: string[]) {
    this.logger.info(
      `[getInvestmentsForAllocation] Fetching investments for ${userIds.length} user(s)`,
    );
    return this.prisma.client.investment.findMany({
      where: { userId: { in: userIds } },
      select: { name: true, currentValue: true },
    });
  }

  async getCategoryExpenseGrouped(userIds: string[], startOfMonth: Date) {
    this.logger.info(`[getCategoryExpenseGrouped] Grouping expenses for ${userIds.length} user(s)`);
    return this.prisma.client.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: { in: userIds },
        date: { gte: startOfMonth },
        type: TransactionType.EXPENSE,
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "asc" } },
    });
  }

  async getCategoriesByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return this.prisma.client.category.findMany({ where: { id: { in: ids } } });
  }

  async getBudgetsWithCategorySpend(userIds: string[], startOfMonth: Date) {
    this.logger.info(
      `[getBudgetsWithCategorySpend] Fetching budgets + spend for ${userIds.length} user(s)`,
    );
    const budgets = await this.prisma.client.budget.findMany({
      where: { userId: { in: userIds } },
      include: { category: { select: { name: true } } },
    });

    const spend = await Promise.all(
      budgets.map((b) =>
        this.prisma.client.transaction.aggregate({
          where: {
            userId: { in: userIds },
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

  async getSafeToSpendData(userIds: string[], startOfMonth: Date) {
    this.logger.info(`[getSafeToSpendData] Fetching inputs for ${userIds.length} user(s)`);
    return Promise.all([
      this.prisma.client.account.findMany({
        where: { userId: { in: userIds }, isActive: true },
        select: { balance: true },
      }),
      this.prisma.client.transaction.findMany({
        where: { userId: { in: userIds }, date: { gte: startOfMonth } },
        select: { amount: true, type: true },
      }),
      this.prisma.client.budget.findMany({
        where: { userId: { in: userIds }, categoryId: { not: null } },
        select: { categoryId: true, limit: true },
      }),
      this.prisma.client.goal.findMany({
        where: { userId: { in: userIds }, deadline: { not: null } },
        select: { targetAmount: true, currentAmount: true, deadline: true },
      }),
    ]);
  }

  async getInvestmentsWithAssetClass(userIds: string[]) {
    this.logger.info(
      `[getInvestmentsWithAssetClass] Fetching investments for ${userIds.length} user(s)`,
    );
    return this.prisma.client.investment.findMany({
      where: { userId: { in: userIds } },
      select: { currentValue: true, assetClass: true },
    });
  }
}

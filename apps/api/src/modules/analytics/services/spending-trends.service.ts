import { Injectable } from "@nestjs/common";
import { Logger } from "@finai/logger";
import {
  calculateAssetAllocation,
  calculateCashFlow,
  calculateFinancialHealthScore,
  calculateSavingsRate,
  generateRecommendations,
  calculateSafeToSpend,
} from "@finai/finance-engine";
import { TransactionType, GoalType } from "@finai/database";
import { AnalyticsRepository } from "../repositories";

/**
 * Handles spending breakdowns, health scores, personalized recommendations,
 * and the "safe to spend" calculation.
 */
@Injectable()
export class SpendingTrendsService {
  private readonly logger = new Logger(SpendingTrendsService.name);
  constructor(private repo: AnalyticsRepository) {}

  async getCategoryBreakdown(userId: string) {
    this.logger.debug(`[getCategoryBreakdown] Computing breakdown for user ${userId.slice(0, 8)}`);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const result = await this.repo.getCategoryExpenseGrouped(userId, startOfMonth);
    const categoryIds = result.map((r) => r.categoryId).filter((id): id is string => id !== null);
    const categories = await this.repo.getCategoriesByIds(categoryIds);
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));
    this.logger.log(
      `[getCategoryBreakdown] Breakdown computed: ${result.length} categorie(s) for user ${userId.slice(0, 8)}`,
    );
    return result.map((r) => ({
      categoryId: r.categoryId,
      name: r.categoryId ? (categoryMap[r.categoryId]?.name ?? "Unknown") : "Uncategorized",
      total: r._sum.amount ?? 0,
    }));
  }

  async getHealthScore(userId: string) {
    this.logger.debug(`[getHealthScore] Computing health score for user ${userId.slice(0, 8)}`);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [accounts, investments, budgetsWithSpend, txns, goals] = await Promise.all([
      this.repo.getAccountBalances(userId),
      this.repo.getInvestmentsWithAssetClass(userId),
      this.repo.getBudgetsWithSpend(userId, startOfMonth),
      this.repo.getTransactionsInRange(userId, startOfMonth),
      this.repo.getGoals(userId),
    ]);

    const normalized = txns.map((t) => ({
      amount: t.amount,
      date: t.date.toISOString(),
      type: t.type as never,
    }));
    const cashFlow = calculateCashFlow(normalized, 1);
    const { income, expense } = cashFlow[0] ?? { income: 0, expense: 0 };
    const savingsRate = calculateSavingsRate(income, expense);

    let budgetAdherence = -1;
    if (budgetsWithSpend.length > 0) {
      const withinBudget = budgetsWithSpend.filter((b) => b.spent <= b.limit).length;
      budgetAdherence = withinBudget / budgetsWithSpend.length;
    }

    const emergencyGoal = goals.find((g) => g.type === GoalType.EMERGENCY_FUND);
    let emergencyFundMonths = 0;
    if (emergencyGoal && expense > 0) {
      emergencyFundMonths = emergencyGoal.currentAmount / expense;
    } else if (emergencyGoal) {
      emergencyFundMonths = emergencyGoal.currentAmount > 0 ? 3 : 0;
    }

    const trackedGoals = goals.filter((g) => g.type !== GoalType.EMERGENCY_FUND);
    const goalProgress =
      trackedGoals.length === 0
        ? -1
        : (trackedGoals.reduce(
            (sum, g) => sum + (g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 0),
            0,
          ) /
            trackedGoals.length) *
          100;

    const distinctAssetClasses = new Set(investments.map((i) => i.assetClass)).size;
    const investmentDiversification = Math.min(100, distinctAssetClasses * 15);
    const totalDebt = accounts.reduce((s, a) => s + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);
    const debtToIncomeRatio = income > 0 ? totalDebt / income : 0;

    return calculateFinancialHealthScore({
      monthlyIncome: income,
      monthlyExpenses: expense,
      savingsRate,
      budgetAdherence,
      emergencyFundMonths: Math.max(0, emergencyFundMonths),
      investmentDiversification,
      debtToIncomeRatio,
      goalProgress: Math.min(100, Math.max(-1, goalProgress)),
    });
  }

  async getRecommendations(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [txns, budgetCategories, goals, investments] = await Promise.all([
      this.repo.getTransactionsInRange(userId, startOfMonth),
      this.repo.getBudgetsWithCategorySpend(userId, startOfMonth),
      this.repo.getGoalsForRecommendations(userId),
      this.repo.getInvestmentsForAllocation(userId),
    ]);

    const normalized = txns.map((t) => ({
      amount: t.amount,
      date: t.date.toISOString(),
      type: t.type as never,
    }));
    const cashFlow = calculateCashFlow(normalized, 1);
    const { income, expense } = cashFlow[0] ?? { income: 0, expense: 0 };
    const savingsRate = calculateSavingsRate(income, expense);

    const emergencyGoal = goals.find((g) => g.type === GoalType.EMERGENCY_FUND);
    let emergencyFundMonths = 0;
    if (emergencyGoal && expense > 0) {
      emergencyFundMonths = emergencyGoal.currentAmount / expense;
    } else if (emergencyGoal) {
      emergencyFundMonths = emergencyGoal.currentAmount > 0 ? 3 : 0;
    }

    const investmentAllocation = calculateAssetAllocation(investments).map((i) => ({
      name: i.name,
      allocation: i.allocation,
    }));

    const recommendations = generateRecommendations({
      savingsRate,
      budgetCategories,
      emergencyFundMonths,
      investmentAllocation,
      goals: goals.map((g) => ({
        name: g.name,
        current: g.currentAmount,
        target: g.targetAmount,
        deadline: g.deadline ? g.deadline.toISOString() : "",
      })),
    });

    return { recommendations, generatedAt: new Date().toISOString() };
  }

  async getSafeToSpend(userId: string) {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [accounts, monthTxns, budgets, goals] = await this.repo.getSafeToSpendData(
      userId,
      startOfMonth,
    );

    const liquidBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    let monthIncome = 0;
    let monthExpenses = 0;
    for (const t of monthTxns) {
      if (t.type === TransactionType.INCOME) monthIncome += Math.abs(t.amount);
      else if (t.type === TransactionType.EXPENSE) monthExpenses += Math.abs(t.amount);
    }

    let remainingBudgetCommitments = 0;
    for (const b of budgets) {
      const spent = monthTxns
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const remaining = b.limit - spent;
      if (remaining > 0) remainingBudgetCommitments += remaining;
    }

    let goalCommitments = 0;
    for (const g of goals) {
      if (!g.deadline) continue;
      const monthsLeft = Math.max(
        1,
        (new Date(g.deadline).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000),
      );
      goalCommitments += Math.max(0, g.targetAmount - g.currentAmount) / monthsLeft;
    }

    return calculateSafeToSpend({
      liquidBalance,
      monthIncome,
      monthExpenses,
      remainingBudgetCommitments,
      goalCommitments,
    });
  }
}

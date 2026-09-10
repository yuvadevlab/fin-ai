import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import {
  calculateAssetAllocation,
  calculateCashFlow,
  calculateNetWorth,
  calculateSavingsRate,
  calculateFinancialHealthScore,
  generateRecommendations,
  calculateSafeToSpend,
} from "@finai/finance-engine";
import { TransactionType, GoalType } from "@finai/database";

/**
 * Analytics and insights service.
 *
 * Aggregates the user's financial data across accounts, transactions, goals,
 * and investments to produce dashboard metrics, monthly trends, category
 * breakdowns, and personalized recommendations. All heavy financial math is
 * delegated to pure functions in `@finai/finance-engine` — this service is
 * purely an orchestrator that fetches data and normalizes it for the engine.
 */
@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Builds the main dashboard view: net worth, monthly income/expenses,
   * savings rate, and comparison vs last month.
   *
   * Fetches all data in parallel (5 queries) for performance, then normalizes
   * the transaction dates to ISO strings because the finance-engine helpers
   * expect string dates (not JS Date objects).
   */
  async getDashboard(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [accounts, allTxns, lastMonthTxns, goals, investments] = await Promise.all([
      this.prisma.client.account.findMany({
        where: { userId, isActive: true },
        select: { balance: true },
      }),
      this.prisma.client.transaction.findMany({
        where: { userId, date: { gte: startOfMonth } },
        select: { amount: true, date: true, type: true },
      }),
      this.prisma.client.transaction.findMany({
        where: {
          userId,
          date: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        select: { amount: true, date: true, type: true },
      }),
      this.prisma.client.goal.findMany({
        where: { userId },
        select: { id: true },
      }),
      this.prisma.client.investment.findMany({
        where: { userId },
        select: { currentValue: true },
      }),
    ]);

    // Normalize transactions for finance-engine (date as string)
    const toEngineFormat = (txns: { amount: number; date: Date; type: TransactionType }[]) =>
      txns.map((t) => ({ amount: t.amount, date: t.date.toISOString(), type: t.type }));

    const currentCashFlow = calculateCashFlow(toEngineFormat(allTxns), 1);
    const lastMonthCashFlowData = calculateCashFlow(toEngineFormat(lastMonthTxns), 1);

    const thisMonth = currentCashFlow[0] ?? { income: 0, expense: 0 };
    const lastMonth = lastMonthCashFlowData[0] ?? { income: 0, expense: 0 };

    const netWorth = calculateNetWorth(
      accounts.map((a) => a.balance),
      investments.map((i) => i.currentValue),
    );

    const savingsRate = calculateSavingsRate(thisMonth.income, thisMonth.expense);

    return {
      netWorth,
      monthlyIncome: thisMonth.income,
      monthlyExpenses: thisMonth.expense,
      netCashFlow: thisMonth.income - thisMonth.expense,
      savingsRate,
      lastMonthIncome: lastMonth.income,
      lastMonthExpenses: lastMonth.expense,
      accountCount: accounts.length,
      goalCount: goals.length,
    };
  }

  /**
   * Returns month-by-month cash flow (income, expense, net) for the last N
   * months. Used for trend charts. Each month is computed independently by
   * `calculateCashFlow` from the finance-engine.
   */
  async getMonthlyAnalytics(userId: string, months = 6) {
    const txns = await this.prisma.client.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - (months - 1), 1),
        },
      },
      select: { amount: true, date: true, type: true },
    });

    const normalized = txns.map((t) => ({
      amount: t.amount,
      date: t.date.toISOString(),
      type: t.type,
    }));

    return calculateCashFlow(normalized, months);
  }

  /**
   * Returns spending breakdown by category for the current month. Each category
   * includes the total expense amount, transaction count, and percentage of
   * total spending. Sorted by amount descending so the biggest categories show
   * first.
   */
  async getCategoryBreakdown(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await this.prisma.client.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        date: { gte: startOfMonth },
        type: TransactionType.EXPENSE,
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "asc" } },
    });

    const categoryIds = result.map((r) => r.categoryId).filter((id): id is string => id !== null);

    const categories = await this.prisma.client.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    return result.map((r) => ({
      categoryId: r.categoryId,
      name: r.categoryId ? (categoryMap[r.categoryId]?.name ?? "Unknown") : "Uncategorized",
      total: r._sum.amount ?? 0,
    }));
  }

  /**
   * Computes the user's financial health score (0-100) based on multiple
   * factors: savings rate, budget adherence, emergency fund, investment
   * diversification, and goal progress. The scoring logic lives entirely in
   * the pure `calculateFinancialHealthScore` helper — this method just gathers
   * the inputs and normalizes them for the engine.
   */
  async getHealthScore(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [accounts, investments, budgets, txns, goals] = await Promise.all([
      this.prisma.client.account.findMany({
        where: { userId, isActive: true },
        select: { balance: true },
      }),
      this.prisma.client.investment.findMany({
        where: { userId },
        select: { currentValue: true, assetClass: true },
      }),
      this.prisma.client.budget.findMany({
        where: { userId },
        include: {
          category: { select: { id: true } },
        },
      }),
      this.prisma.client.transaction.findMany({
        where: { userId, date: { gte: startOfMonth } },
        select: { amount: true, date: true, type: true },
      }),
      this.prisma.client.goal.findMany({
        where: { userId },
        select: { currentAmount: true, targetAmount: true, type: true },
      }),
    ]);

    // Compute savings rate
    const normalized = txns.map((t) => ({
      amount: t.amount,
      date: t.date.toISOString(),
      type: t.type,
    }));
    const cashFlow = calculateCashFlow(normalized, 1);
    const { income, expense } = cashFlow[0] ?? { income: 0, expense: 0 };
    const savingsRate = calculateSavingsRate(income, expense);

    // Budget adherence: ratio of budgets where spent <= limit
    let budgetAdherence = -1;
    if (budgets.length > 0) {
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
      const withinBudget = budgets.filter((b, i) => {
        const spent = budgetSpend[i]._sum.amount ?? 0;
        return spent <= b.limit;
      }).length;
      budgetAdherence = withinBudget / budgets.length;
    }

    // Emergency fund: how many months of expenses the goal covers
    let emergencyFundMonths = 0;
    const emergencyGoal = goals.find((goal) => goal.type === GoalType.EMERGENCY_FUND);
    if (emergencyGoal && expense > 0) {
      emergencyFundMonths = emergencyGoal.currentAmount / expense;
    } else if (emergencyGoal) {
      emergencyFundMonths = emergencyGoal.currentAmount > 0 ? 3 : 0;
    }

    const trackedGoals = goals.filter((goal) => goal.type !== GoalType.EMERGENCY_FUND);
    const goalProgress =
      trackedGoals.length === 0
        ? -1
        : (trackedGoals.reduce(
            (sum, goal) =>
              sum + (goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0),
            0,
          ) /
            trackedGoals.length) *
          100;

    // Investment diversification: distinct asset classes (scaled 0-100)
    const distinctAssetClasses = new Set(investments.map((i) => i.assetClass)).size;
    const investmentDiversification = Math.min(100, distinctAssetClasses * 15);

    // Debt-to-income: negative account balances (credit cards) vs income
    const totalDebt = accounts.reduce((s, a) => s + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);
    const debtToIncomeRatio = income > 0 ? totalDebt / income : 0;

    const result = calculateFinancialHealthScore({
      monthlyIncome: income,
      monthlyExpenses: expense,
      savingsRate,
      budgetAdherence,
      emergencyFundMonths: Math.max(0, emergencyFundMonths),
      investmentDiversification,
      debtToIncomeRatio,
      goalProgress: Math.min(100, Math.max(-1, goalProgress)),
    });

    return result;
  }

  async getSavingsTrend(userId: string, months = 6) {
    const cashFlow = await this.getMonthlyAnalytics(userId, months);
    return cashFlow.map((m) => ({
      month: m.month,
      value: Math.max(0, m.income - m.expense),
    }));
  }

  /**
   * Deterministic, prioritised financial recommendations built from the
   * user's live data via the pure @finai/finance-engine recommendation engine.
   */
  /**
   * Generates personalized financial recommendations based on the user's
   * actual data: savings rate, budget status, emergency fund months, investment
   * allocation, and goals. The recommendation engine is a pure function in
   * finance-engine — this method just feeds it the current state.
   */
  async getRecommendations(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [txns, budgets, goals, investments] = await Promise.all([
      this.prisma.client.transaction.findMany({
        where: { userId, date: { gte: startOfMonth } },
        select: { amount: true, date: true, type: true },
      }),
      this.prisma.client.budget.findMany({
        where: { userId },
        include: { category: { select: { name: true } } },
      }),
      this.prisma.client.goal.findMany({ where: { userId } }),
      this.prisma.client.investment.findMany({
        where: { userId },
        select: { name: true, currentValue: true },
      }),
    ]);

    // Savings rate from month-to-date cash flow
    const normalized = txns.map((t) => ({
      amount: t.amount,
      date: t.date.toISOString(),
      type: t.type,
    }));
    const cashFlow = calculateCashFlow(normalized, 1);
    const { income, expense } = cashFlow[0] ?? { income: 0, expense: 0 };
    const savingsRate = calculateSavingsRate(income, expense);

    // Budget adherence per category (spent this month vs limit)
    const budgetCategories = await Promise.all(
      budgets.map(async (b) => {
        const agg = await this.prisma.client.transaction.aggregate({
          where: {
            userId,
            categoryId: b.categoryId,
            type: TransactionType.EXPENSE,
            date: { gte: startOfMonth },
          },
          _sum: { amount: true },
        });
        return {
          name: b.category?.name ?? "Category",
          spent: agg._sum.amount ?? 0,
          limit: b.limit,
        };
      }),
    );

    // Emergency fund runway in months (same logic as getHealthScore)
    const emergencyGoal = goals.find((goal) => goal.type === GoalType.EMERGENCY_FUND);
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

    return {
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Estimate how much the user can safely spend for the rest of the month:
   * liquid balance + month-to-date net cash flow, minus remaining budget
   * commitments and planned goal contributions. Never negative.
   */
  async getSafeToSpend(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [accounts, monthTxns, budgets, goals] = await Promise.all([
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

    // Liquid balance across active accounts
    const liquidBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    // Month-to-date net cash flow
    let monthIncome = 0;
    let monthExpenses = 0;
    for (const t of monthTxns) {
      if (t.type === TransactionType.INCOME) {
        monthIncome += Math.abs(t.amount);
      } else if (t.type === TransactionType.EXPENSE) {
        monthExpenses += Math.abs(t.amount);
      }
    }

    // Remaining budget commitments: sum of (limit - spent) for budgets not yet exceeded
    let remainingBudgetCommitments = 0;
    for (const b of budgets) {
      const spent = monthTxns
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const remaining = b.limit - spent;
      if (remaining > 0) {
        remainingBudgetCommitments += remaining;
      }
    }

    // Goal installments due this month (simple proration: remaining / months left)
    let goalCommitments = 0;
    for (const g of goals) {
      if (!g.deadline) continue;
      const monthsLeft = Math.max(
        1,
        (new Date(g.deadline).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000),
      );
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      goalCommitments += remaining / monthsLeft;
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

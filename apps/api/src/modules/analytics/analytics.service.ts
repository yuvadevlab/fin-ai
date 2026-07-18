import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  calculateCashFlow,
  calculateNetWorth,
  calculateSavingsRate,
  calculateFinancialHealthScore,
} from "@finai/finance-engine";
import { TransactionType } from "@finai/database";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(workspaceId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [accounts, allTxns, lastMonthTxns, goals, investments] = await Promise.all([
      this.prisma.client.account.findMany({
        where: { workspaceId, isActive: true },
        select: { balance: true },
      }),
      this.prisma.client.transaction.findMany({
        where: { workspaceId, date: { gte: startOfMonth } },
        select: { amount: true, date: true, type: true },
      }),
      this.prisma.client.transaction.findMany({
        where: {
          workspaceId,
          date: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        select: { amount: true, date: true, type: true },
      }),
      this.prisma.client.goal.findMany({
        where: { workspaceId },
        select: { id: true },
      }),
      this.prisma.client.investment.findMany({
        where: { workspaceId },
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

  async getMonthlyAnalytics(workspaceId: string, months = 6) {
    const txns = await this.prisma.client.transaction.findMany({
      where: {
        workspaceId,
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

  async getCategoryBreakdown(workspaceId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await this.prisma.client.transaction.groupBy({
      by: ["categoryId"],
      where: {
        workspaceId,
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

  async getHealthScore(workspaceId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [accounts, investments, budgets, txns, emergencyGoal] = await Promise.all([
      this.prisma.client.account.findMany({
        where: { workspaceId, isActive: true },
        select: { balance: true },
      }),
      this.prisma.client.investment.findMany({
        where: { workspaceId },
        select: { currentValue: true, assetClass: true },
      }),
      this.prisma.client.budget.findMany({
        where: { workspaceId },
        include: {
          category: { select: { id: true } },
        },
      }),
      this.prisma.client.transaction.findMany({
        where: { workspaceId, date: { gte: startOfMonth } },
        select: { amount: true, date: true, type: true },
      }),
      // Look for an emergency fund goal
      this.prisma.client.goal.findFirst({
        where: { workspaceId, name: { contains: "Emergency", mode: "insensitive" } },
        select: { currentAmount: true, targetAmount: true },
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
              workspaceId,
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
    if (emergencyGoal && expense > 0) {
      emergencyFundMonths = emergencyGoal.currentAmount / expense;
    } else if (emergencyGoal) {
      // If no expenses this month, estimate from goal
      emergencyFundMonths = emergencyGoal.currentAmount > 0 ? 3 : 0;
    }

    // Investment diversification: distinct asset classes (scaled 0-100)
    const distinctAssetClasses = new Set(investments.map((i) => i.assetClass)).size;
    const investmentDiversification = Math.min(100, distinctAssetClasses * 15);

    // Debt-to-income: negative account balances (credit cards) vs income
    const totalDebt = accounts.reduce((s, a) => s + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);
    const debtToIncomeRatio = income > 0 ? totalDebt / income : 0;

    const result = calculateFinancialHealthScore({
      savingsRate,
      budgetAdherence,
      emergencyFundMonths: Math.max(0, emergencyFundMonths),
      investmentDiversification,
      debtToIncomeRatio,
    });

    return result;
  }

  async getSavingsTrend(workspaceId: string, months = 6) {
    const cashFlow = await this.getMonthlyAnalytics(workspaceId, months);
    return cashFlow.map((m) => ({
      month: m.month,
      value: Math.max(0, m.income - m.expense),
    }));
  }
}

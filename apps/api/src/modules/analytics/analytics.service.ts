import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { calculateCashFlow, calculateNetWorth, calculateSavingsRate } from "@finai/finance-engine";

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
        select: { amount: true, date: true },
      }),
      this.prisma.client.transaction.findMany({
        where: {
          workspaceId,
          date: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        select: { amount: true, date: true },
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
    const toEngineFormat = (txns: { amount: number; date: Date }[]) =>
      txns.map((t) => ({ amount: t.amount, date: t.date.toISOString() }));

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
      select: { amount: true, date: true },
    });

    const normalized = txns.map((t) => ({
      amount: t.amount,
      date: t.date.toISOString(),
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
        amount: { lt: 0 },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "asc" } },
    });

    const categoryIds = result
      .map((r: { categoryId: string | null }) => r.categoryId)
      .filter(Boolean) as string[];

    const categories = await this.prisma.client.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    return result.map((r: { categoryId: string | null; _sum: { amount: number | null } }) => ({
      categoryId: r.categoryId,
      name: r.categoryId ? (categoryMap[r.categoryId]?.name ?? "Unknown") : "Uncategorized",
      total: Math.abs(r._sum.amount ?? 0),
    }));
  }
}

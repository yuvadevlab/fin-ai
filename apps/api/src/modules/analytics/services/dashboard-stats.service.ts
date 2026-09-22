import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { calculateCashFlow, calculateNetWorth, calculateSavingsRate } from "@finai/finance-engine";
import { AnalyticsRepository } from "../repositories";

/**
 * Computes dashboard KPIs: net worth, monthly cash flow, savings rate,
 * and month-over-month comparisons.
 */
@Injectable()
export class DashboardStatsService {
  private readonly logger = new Logger(DashboardStatsService.name);
  constructor(private repo: AnalyticsRepository) {}

  async getDashboard(userId: string) {
    this.logger.debug(`[getDashboard] Computing dashboard KPIs for user ${userId.slice(0, 8)}`);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [accounts, allTxns, lastMonthTxns, goals, investments] = await Promise.all([
      this.repo.getAccountBalances(userId),
      this.repo.getTransactionsInRange(userId, startOfMonth),
      this.repo.getTransactionsInRange(userId, startOfLastMonth, endOfLastMonth),
      this.repo.getGoalCount(userId),
      this.repo.getInvestmentValues(userId),
    ]);

    const toEngineFormat = (txns: { amount: number; date: Date; type: string }[]) =>
      txns.map((t) => ({ amount: t.amount, date: t.date.toISOString(), type: t.type as never }));

    const currentCashFlow = calculateCashFlow(toEngineFormat(allTxns), 1);
    const lastMonthCashFlowData = calculateCashFlow(toEngineFormat(lastMonthTxns), 1);

    const thisMonth = currentCashFlow[0] ?? { income: 0, expense: 0 };
    const lastMonth = lastMonthCashFlowData[0] ?? { income: 0, expense: 0 };

    const netWorth = calculateNetWorth(
      accounts.map((a) => a.balance),
      investments.map((i) => i.currentValue),
    );
    const savingsRate = calculateSavingsRate(thisMonth.income, thisMonth.expense);

    this.logger.log(
      `[getDashboard] Dashboard computed for user ${userId.slice(0, 8)}: netWorth=${netWorth}, income=${thisMonth.income}, expenses=${thisMonth.expense}, savingsRate=${savingsRate}`,
    );
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

  async getMonthlyAnalytics(userId: string, months = 6) {
    this.logger.debug(
      `[getMonthlyAnalytics] Computing ${months}-month cash flow for user ${userId.slice(0, 8)}`,
    );
    const txns = await this.repo.getTransactionsInRange(
      userId,
      new Date(new Date().getFullYear(), new Date().getMonth() - (months - 1), 1),
    );
    const normalized = txns.map((t) => ({
      amount: t.amount,
      date: t.date.toISOString(),
      type: t.type as never,
    }));
    return calculateCashFlow(normalized, months);
  }

  async getSavingsTrend(userId: string, months = 6) {
    this.logger.debug(
      `[getSavingsTrend] Computing ${months}-month savings trend for user ${userId.slice(0, 8)}`,
    );
    const cashFlow = await this.getMonthlyAnalytics(userId, months);
    return cashFlow.map((m) => ({ month: m.month, value: Math.max(0, m.income - m.expense) }));
  }
}

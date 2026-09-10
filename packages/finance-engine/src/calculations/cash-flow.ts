/**
 * Cash flow calculations — pure functions.
 */

import { type CashFlowDataPoint, TransactionType } from "@finai/shared-types";

/**
 * Build a monthly income-vs-expense series for the dashboard cash-flow chart.
 *
 * IMPORTANT: the month window is determined by the SERVER's local calendar
 * (new Date(year, monthIndex, 1) uses local getters), and transactions are
 * bucketed by comparing local year/month — NOT by string prefixes on the
 * ISO date, which are UTC-based and can mis-bucket days near midnight for
 * IST users. TRANSFER and INVESTMENT types are deliberately ignored: they
 * move money between the user's own pockets and are not income or spending.
 * Amounts are taken with Math.abs() because sign encodes direction in some
 * data sources, while `type` alone decides the bucket here.
 *
 * @param months How many recent months to include (default 6); the last
 *   entry is the current, still-incomplete month.
 * @returns One { month, income, expense } point per month, oldest first,
 *   including zero-activity months so the chart shows continuous gaps.
 */
export function calculateCashFlow(
  transactions: { amount: number; date: string; type: TransactionType }[],
  months: number = 6,
): CashFlowDataPoint[] {
  const now = new Date();
  const result: CashFlowDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const month = d.getMonth();

    const monthTransactions = transactions.filter((t) => {
      const td = new Date(t.date);
      return td.getFullYear() === year && td.getMonth() === month;
    });

    const income = monthTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const expense = monthTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    result.push({ month: monthKey, income, expense });
  }

  return result;
}

/**
 * Net position per month (income − expense). Negative values mean the user
 * drew down money that month; the sign is meaningful here, unlike the
 * savings KPIs which clamp at zero.
 */
export function calculateNetCashFlow(
  cashFlow: CashFlowDataPoint[],
): { month: string; net: number }[] {
  return cashFlow.map((cf) => ({
    month: cf.month,
    net: cf.income - cf.expense,
  }));
}

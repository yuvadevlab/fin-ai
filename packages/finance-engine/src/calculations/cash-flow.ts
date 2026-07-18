/**
 * Cash flow calculations — pure functions.
 */

import { type CashFlowDataPoint, TransactionType } from "@finai/shared-types";

/**
 * Calculate cash flow from a list of transaction amounts grouped by month.
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
 * Calculate net cash flow (income - expense) for each period.
 */
export function calculateNetCashFlow(
  cashFlow: CashFlowDataPoint[],
): { month: string; net: number }[] {
  return cashFlow.map((cf) => ({
    month: cf.month,
    net: cf.income - cf.expense,
  }));
}

/**
 * Savings calculations — pure functions.
 * No I/O, no side effects.
 */

/**
 * Savings rate = (income − expenses) / income, as a percentage of income.
 *
 * Guard rules:
 * - income ≤ 0 → 0: a rate is meaningless without income (avoids division
 *   by zero and misleading negative percentages).
 * - Result clamped at 0: overspending produces a negative raw rate, but the
 *   product contract reports "no savings" as 0 rather than e.g. -25%.
 * Rounded to 0.1% for display stability.
 *
 * @returns Value between 0 and 100
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const rate = ((income - expenses) / income) * 100;
  return Math.max(0, Math.round(rate * 10) / 10);
}

/**
 * Absolute money left over after expenses. Clamped at 0 so overspending
 * reports 0 savings instead of a negative figure — downstream UI (progress
 * rings, KPI cards) assumes non-negative savings amounts.
 */
export function calculateMonthlySavings(income: number, expenses: number): number {
  return Math.max(0, income - expenses);
}

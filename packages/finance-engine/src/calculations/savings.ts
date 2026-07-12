/**
 * Savings calculations — pure functions.
 * No I/O, no side effects.
 */

/**
 * Calculate savings rate as percentage of income.
 * @returns Value between 0 and 100
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const rate = ((income - expenses) / income) * 100;
  return Math.max(0, Math.round(rate * 10) / 10);
}

/**
 * Calculate monthly savings (income minus expenses).
 */
export function calculateMonthlySavings(income: number, expenses: number): number {
  return Math.max(0, income - expenses);
}

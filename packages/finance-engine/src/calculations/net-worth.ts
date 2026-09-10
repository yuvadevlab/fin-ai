/**
 * Net worth calculations — pure functions.
 */

/**
 * Net worth = liquid account balances + investment values.
 *
 * Credit-card liabilities are handled by sign convention: card accounts
 * carry negative balances, so they reduce the total automatically. This
 * function deliberately knows nothing about account types — callers
 * pre-filter to the accounts they consider part of net worth.
 */
export function calculateNetWorth(accountBalances: number[], investmentValues: number[]): number {
  const accounts = accountBalances.reduce((sum, b) => sum + b, 0);
  const investments = investmentValues.reduce((sum, v) => sum + v, 0);
  return accounts + investments;
}

/**
 * Change in net worth between two snapshots.
 *
 * The percentage is undefined when the previous snapshot is zero (division
 * by zero / meaningless growth from nothing), so it reports 0 rather than
 * Infinity. Rounded to 0.1% to keep the UI and AI summaries readable.
 */
export function calculateNetWorthChange(
  currentNetWorth: number,
  previousNetWorth: number,
): { absolute: number; percentage: number } {
  const absolute = currentNetWorth - previousNetWorth;
  const percentage =
    previousNetWorth === 0 ? 0 : Math.round((absolute / previousNetWorth) * 100 * 10) / 10;
  return { absolute, percentage };
}

/**
 * Net worth calculations — pure functions.
 */

/**
 * Calculate net worth from account balances and investment values.
 */
export function calculateNetWorth(accountBalances: number[], investmentValues: number[]): number {
  const accounts = accountBalances.reduce((sum, b) => sum + b, 0);
  const investments = investmentValues.reduce((sum, v) => sum + v, 0);
  return accounts + investments;
}

/**
 * Calculate net worth change between two periods.
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

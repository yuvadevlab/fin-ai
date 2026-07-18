/**
 * Investment calculations — pure functions.
 */

/**
 * Calculate total portfolio value from individual investments.
 */
export function calculatePortfolioValue(investments: { currentValue: number }[]): number {
  return investments.reduce((sum, inv) => sum + inv.currentValue, 0);
}

/**
 * Calculate asset allocation percentages.
 */
export function calculateAssetAllocation(
  investments: { name: string; currentValue: number }[],
): { name: string; value: number; allocation: number }[] {
  const total = calculatePortfolioValue(investments);
  if (total === 0)
    return investments.map((i) => ({
      ...i,
      value: i.currentValue,
      allocation: 0,
    }));

  return investments.map((inv) => ({
    ...inv,
    name: inv.name,
    value: inv.currentValue,
    allocation: Math.round((inv.currentValue / total) * 100),
  }));
}

/**
 * Calculate unrealised profit/loss.
 */
export function calculateUnrealisedPL(
  currentValue: number,
  investedAmount: number,
): { absolute: number; percentage: number } {
  const absolute = currentValue - investedAmount;
  const percentage =
    investedAmount === 0 ? 0 : Math.round((absolute / investedAmount) * 100 * 10) / 10;
  return { absolute, percentage };
}

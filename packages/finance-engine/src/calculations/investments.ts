/**
 * Investment calculations — pure functions.
 */

/**
 * Total portfolio value: the sum of each investment's current value.
 * (Cost basis is intentionally ignored — this is what the holdings are
 * worth today, not what was paid.)
 */
export function calculatePortfolioValue(investments: { currentValue: number }[]): number {
  return investments.reduce((sum, inv) => sum + inv.currentValue, 0);
}

/**
 * Per-investment allocation as a percentage of total portfolio value.
 *
 * When the portfolio totals 0 (no holdings, or all zero values) every
 * allocation reports 0 instead of NaN — percentages of nothing are
 * undefined, not zero-divided. Allocations are rounded to whole percent,
 * so rows may not sum to exactly 100.
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
 * Unrealised profit/loss: how much a holding has gained/lost versus what
 * was paid. Percentage is 0 when nothing was invested (avoids division by
 * zero — an asset appearing from nowhere has no meaningful return %), and
 * is rounded to 0.1% for display.
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

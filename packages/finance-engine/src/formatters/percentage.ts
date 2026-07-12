/**
 * Percentage and change formatting — pure functions.
 */

/**
 * Format a number as a percentage string.
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a change value with sign prefix.
 * e.g., 12.4 → "+12.4%", -3.1 → "-3.1%"
 */
export function formatChange(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

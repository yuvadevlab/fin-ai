/**
 * Currency formatting — pure functions.
 */

/**
 * Format a number as INR with the ₹ symbol and Indian grouping.
 * Matches the reference UI's `inr()` function.
 */
export function formatINR(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const showDecimals = Number(abs.toFixed(2)) % 1 !== 0;
  return (
    sign +
    "₹" +
    abs.toLocaleString("en-IN", {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Format a number as a short currency string.
 * e.g., 125000 → ₹1.3L, 48200 → ₹48k
 */
export function formatCurrencyShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 10_000_000) return sign + "₹" + (abs / 10_000_000).toFixed(1) + "Cr";
  if (abs >= 100_000) return sign + "₹" + (abs / 100_000).toFixed(1) + "L";
  if (abs >= 1_000) return sign + "₹" + Math.round(abs / 1_000) + "k";
  return sign + "₹" + abs;
}

/**
 * Parse a formatted currency string back to a number.
 */
export function parseCurrencyValue(formatted: string): number {
  const cleaned = formatted.replace(/[₹,\s]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

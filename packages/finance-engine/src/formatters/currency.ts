/**
 * Currency formatting — pure functions.
 */

/**
 * Format a number as INR with the ₹ symbol and Indian digit grouping
 * (en-IN locale: 12,34,567 — lakh/crore grouping, not western thousands).
 *
 * Decimals are shown only when the amount actually has a fractional part,
 * so "₹250" stays compact while "₹250.50" keeps paise precision. The
 * `Number(abs.toFixed(2)) % 1` dance (instead of `abs % 1`) avoids float
 * artifacts like 0.30000000000000004 being treated as a fraction.
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
 * Compact money for KPI tiles and chart labels using the Indian short scale
 * (k = thousand, L = lakh = 100k, Cr = crore = 10M). Thousands round to a
 * whole k (an extra decimal buys nothing at that scale) while lakhs/crores
 * keep one decimal because precision matters more as magnitudes grow.
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
 * Inverse of formatINR: strip ₹/commas/whitespace and parse. Unparseable
 * input returns 0 (not NaN) so arithmetic callers never poison a total
 * with NaN. Cannot reverse formatCurrencyShort's "L"/"Cr" suffixes.
 */
export function parseCurrencyValue(formatted: string): number {
  const cleaned = formatted.replace(/[₹,\s]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

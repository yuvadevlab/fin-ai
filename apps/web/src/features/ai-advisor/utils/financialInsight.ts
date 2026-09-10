/**
 * Detects a leading structured financial figure in assistant markdown and
 * returns it for separate card rendering. Returns null when no clear pattern
 * is found — the prose is then shown as-is.
 *
 * Supported patterns (conservative — we never invent numbers):
 *   ₹18,400          → amount with symbol
 *   Safe to spend     → label on preceding line
 *
 * The figure is detected from the FIRST non-empty lines of the text. We look
 * for a prominent ₹ amount followed (or preceded) by a short descriptive
 * label, optionally with a sub-line of context.
 */

export interface FinancialInsightData {
  /** The main figure, e.g. "₹18,400". */
  value: string;
  /** Short label describing the figure, e.g. "Safe to spend". */
  label: string;
  /** Optional context line(s) below the figure. */
  context: string;
  /** The remaining prose after the insight block. */
  remainingText: string;
}

const AMOUNT_RE = /(₹[\d,]+(?:\.\d{1,2})?|\b\d[\d,]*(?:\.\d{1,2})?\b\s*(?:rupees|lakh|crore|k)?)/i;

/**
 * Splits assistant markdown into an optional leading financial insight + the
 * remaining prose. Only triggers on a clear, conservative pattern.
 */
export function extractFinancialInsight(text: string): FinancialInsightData | null {
  if (!text) return null;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;

  // Try to find a label line immediately followed by a prominent amount, OR
  // an amount line followed by a label. We scan the first 6 lines only.
  const scanLines = lines.slice(0, 6);

  for (let i = 0; i < scanLines.length; i++) {
    const line = scanLines[i];

    // Bold or plain amount on its own line: **₹18,400** or ₹18,400
    const amountMatch = line.match(/^\*?\*?(₹[\d,]+(?:\.\d{1,2})?)\*?\*?$/);
    if (amountMatch) {
      const value = amountMatch[1];
      // Label is the line before (if it looks like a short title) or after.
      let label = "";
      if (i > 0 && isShortLabel(scanLines[i - 1])) {
        label = cleanMarkdown(scanLines[i - 1]);
      } else if (i < scanLines.length - 1 && isShortLabel(scanLines[i + 1])) {
        label = cleanMarkdown(scanLines[i + 1]);
      }
      if (!label) continue;

      // Line indices consumed by the insight card (figure + its label line).
      const consumed = new Set<number>([i]);
      if (i > 0 && cleanMarkdown(scanLines[i - 1]) === label) consumed.add(i - 1);
      if (i < scanLines.length - 1 && cleanMarkdown(scanLines[i + 1]) === label)
        consumed.add(i + 1);

      // Context: up to two non-amount lines from the remaining scan window.
      const context = scanLines
        .filter((_, idx) => !consumed.has(idx))
        .filter((l) => !AMOUNT_RE.test(l))
        .slice(0, 2)
        .map(cleanMarkdown)
        .filter(Boolean)
        .join(" ");

      // Remaining prose = unconsumed scan-window lines + everything after.
      const remainingLines = [
        ...scanLines.filter((_, idx) => !consumed.has(idx)),
        ...lines.slice(scanLines.length),
      ];
      const remainingText = remainingLines.join("\n").trim();

      return { value, label, context, remainingText };
    }
  }

  return null;
}

function isShortLabel(line: string): boolean {
  const cleaned = cleanMarkdown(line);
  if (!cleaned) return false;
  // A label is short text without a ₹ amount, not a full sentence.
  if (AMOUNT_RE.test(cleaned) && cleaned.startsWith("₹")) return false;
  if (cleaned.length > 50) return false;
  if (/[.!?]$/.test(cleaned) && cleaned.split(" ").length > 6) return false;
  return true;
}

function cleanMarkdown(s: string): string {
  return s
    .replace(/^#+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .trim();
}

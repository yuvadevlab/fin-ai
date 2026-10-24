/**
 * @file apps/api/src/modules/agent/tools/transactions.date-label.ts
 * @description Format card-safe date label for transaction confirmation cards.
 * @module @finai/api/agent/tools/transactions-date-label
 */

import { resolveAgentTransactionDate } from "../../date-expression";
import { serverTodayISO } from "../../date.utils";

/**
 * Format the card-safe date label: resolved YYYY-MM-DD, plus the user's
 * original wording in parentheses so the confirmation card shows exactly
 * what they asked for ("2026-09-04 (yesterday)"). Falls back to the raw
 * phrase when it can't be parsed.
 */
export function dateLabel(input: { date?: string; dateExpression?: string }): string {
  try {
    const resolved = resolveAgentTransactionDate({
      date: input.date,
      dateExpression: input.dateExpression,
    });
    return input.dateExpression ? `${resolved} (${input.dateExpression})` : resolved;
  } catch {
    return input.date ?? input.dateExpression ?? serverTodayISO();
  }
}

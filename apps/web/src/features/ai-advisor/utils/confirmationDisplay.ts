/**
 * @file apps/web/src/features/ai-advisor/utils/confirmationDisplay.ts
 * @description Formatters and sanitizers for confirmation card rows and labels in the UI.
 * @module @finai/web/features/ai-advisor/utils/confirmationDisplay
 */

import {
  AgentCardType,
  AgentToolName,
  BULK_ITEM_PREFIX,
  ConfirmationRowLabel,
} from "@finai/shared-types";
import type { AgentConfirmation } from "../api/agentTypes";

/**
 * Humanizes raw or sentinel confirmation row keys into user-friendly Title Case labels.
 *
 * Examples:
 * - "__bulk_count__" -> "Total Transactions"
 * - "__bulk_total__" -> "Total Amount"
 * - "to_account" -> "To Account"
 * - "accountId" -> "Account ID"
 */
export function formatConfirmationLabel(rawKey: string): string {
  if (!rawKey) return "";
  if (rawKey === ConfirmationRowLabel.BULK_COUNT || rawKey === "__bulk_count__") {
    return "Total Transactions";
  }
  if (rawKey === ConfirmationRowLabel.BULK_TOTAL || rawKey === "__bulk_total__") {
    return "Total Amount";
  }
  // Strip surrounding underscores: __foo__ -> foo
  let clean = rawKey.replace(/^__+|__+$/g, "").trim();
  // Handle camelCase: "toAccount" -> "to Account"
  clean = clean.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Replace underscores and hyphens with spaces
  clean = clean.replace(/[_-]+/g, " ").trim();
  // Title Case each word
  return clean.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Produces clean, sentinel-free compact rows for action summaries in ContextPanel.
 * For bulk confirmations, safely extracts count and total amount without leaking
 * "__item_0__", "start", or delimiter keys.
 */
export function getCompactActionRows(
  confirmation: AgentConfirmation | null | undefined,
): [string, string][] {
  if (!confirmation?.card?.rows || confirmation.card.rows.length === 0) {
    return [];
  }
  const rows = confirmation.card.rows;

  const isBulk =
    confirmation.card.type === AgentCardType.BULK_CONFIRMATION ||
    confirmation.tool === AgentToolName.TRANSACTIONS_BULK_CREATE ||
    rows.some(([k]) => k === ConfirmationRowLabel.BULK_COUNT || k === "__bulk_count__");

  if (isBulk) {
    const countRow = rows.find(
      ([k]) => k === ConfirmationRowLabel.BULK_COUNT || k === "__bulk_count__",
    );
    const totalRow = rows.find(
      ([k]) => k === ConfirmationRowLabel.BULK_TOTAL || k === "__bulk_total__",
    );
    const compact: [string, string][] = [];
    if (countRow) {
      compact.push(["Total Transactions", countRow[1]]);
    }
    if (totalRow) {
      compact.push(["Total Amount", totalRow[1]]);
    }
    return compact;
  }

  return rows
    .filter(([k, v]) => !k.startsWith("__") && !k.startsWith(BULK_ITEM_PREFIX) && v !== "start")
    .slice(0, 3)
    .map(([k, v]) => [formatConfirmationLabel(k), v]);
}

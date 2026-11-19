import {
  AgentConfirmationStatus,
  ConfirmationRowLabel,
  TransactionType,
} from "@fin-ai/shared-types";

export const STATUS_META: Record<AgentConfirmationStatus, { label: string; className: string }> = {
  [AgentConfirmationStatus.PENDING]: {
    label: "Awaiting your approval",
    className: "fn-confirm-card-status-badge--pending",
  },
  [AgentConfirmationStatus.EXECUTED]: {
    label: "Confirmed & executed",
    className: "fn-confirm-card-status-badge--executed",
  },
  [AgentConfirmationStatus.REJECTED]: {
    label: "Rejected",
    className: "fn-confirm-card-status-badge--rejected",
  },
  [AgentConfirmationStatus.FAILED]: {
    label: "Failed to execute",
    className: "fn-confirm-card-status-badge--failed",
  },
};

export const TRANSACTION_TYPE_ACCENTS: Record<
  string,
  { card: string; border: string; icon: string; badge: string }
> = {
  [TransactionType.INCOME]: {
    card: "fn-confirm-card--income",
    border: "fn-confirm-card--income",
    icon: "fn-confirm-card-icon--income",
    badge: "fn-confirm-card-type-badge--income",
  },
  [TransactionType.EXPENSE]: {
    card: "fn-confirm-card--expense",
    border: "fn-confirm-card--expense",
    icon: "fn-confirm-card-icon--expense",
    badge: "fn-confirm-card-type-badge--expense",
  },
  [TransactionType.TRANSFER]: {
    card: "fn-confirm-card--transfer",
    border: "fn-confirm-card--transfer",
    icon: "fn-confirm-card-icon--transfer",
    badge: "fn-confirm-card-type-badge--transfer",
  },
  [TransactionType.INVESTMENT]: {
    card: "fn-confirm-card--investment",
    border: "fn-confirm-card--investment",
    icon: "fn-confirm-card-icon--investment",
    badge: "fn-confirm-card-type-badge--investment",
  },
  [TransactionType.GOAL]: {
    card: "fn-confirm-card--goal",
    border: "fn-confirm-card--goal",
    icon: "fn-confirm-card-icon--goal",
    badge: "fn-confirm-card-type-badge--goal",
  },
};

/**
 * Returns the transaction type styling accent if the card rows represent
 * a transaction with a recognized "Type" field.
 */
export function getTransactionTypeAccent(rows?: [string, string][]) {
  const typeRow = rows?.find(([k]) => k.toLowerCase() === ConfirmationRowLabel.TYPE.toLowerCase());
  const txType = typeRow?.[1]?.toUpperCase();
  return txType ? TRANSACTION_TYPE_ACCENTS[txType] : undefined;
}

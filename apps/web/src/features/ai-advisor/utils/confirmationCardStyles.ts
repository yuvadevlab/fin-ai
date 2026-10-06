import type { AgentConfirmation } from "../api/agentTypes";

export const STATUS_META: Record<
  AgentConfirmation["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Awaiting your approval",
    className: "text-primary bg-primary/10 border-primary/20",
  },
  executed: {
    label: "Confirmed & executed",
    className: "text-primary bg-primary/10 border-primary/20",
  },
  rejected: {
    label: "Rejected",
    className: "text-muted-foreground bg-muted/40 border-border/60",
  },
  failed: {
    label: "Failed to execute",
    className: "text-destructive bg-destructive/10 border-destructive/20",
  },
};

export const TRANSACTION_TYPE_ACCENTS: Record<
  string,
  { border: string; icon: string; badge: string }
> = {
  INCOME: {
    border: "border-l-4 border-l-primary",
    icon: "text-primary",
    badge: "text-primary bg-primary/10 border-primary/20",
  },
  EXPENSE: {
    border: "border-l-4 border-l-destructive",
    icon: "text-destructive",
    badge: "text-destructive bg-destructive/10 border-destructive/20",
  },
  TRANSFER: {
    border: "border-l-4 border-l-amber-500",
    icon: "text-amber-500",
    badge: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  INVESTMENT: {
    border: "border-l-4 border-l-blue-500",
    icon: "text-blue-500",
    badge: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  GOAL: {
    border: "border-l-4 border-l-purple-500",
    icon: "text-purple-500",
    badge: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
};

/**
 * Returns the transaction type styling accent if the card rows represent
 * a transaction with a recognized "Type" field.
 */
export function getTransactionTypeAccent(rows?: [string, string][]) {
  const typeRow = rows?.find(([k]) => k.toLowerCase() === "type");
  const txType = typeRow?.[1]?.toUpperCase();
  return txType ? TRANSACTION_TYPE_ACCENTS[txType] : undefined;
}

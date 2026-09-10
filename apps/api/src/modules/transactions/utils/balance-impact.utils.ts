import { TransactionType } from "@finai/database";

/**
 * Computes the balance delta for a given transaction type and amount.
 *
 * Returns how much the source account and destination account (for transfers)
 * should change.
 *
 * - INCOME:     source +amount, destination 0
 * - EXPENSE:    source -amount, destination 0
 * - TRANSFER:   source -amount, destination +amount
 * - INVESTMENT: source -amount, destination 0
 * - GOAL:       source -amount, destination 0
 *
 * Pure function — zero I/O, zero side-effects.
 */
export function getTransactionImpact(
  type: TransactionType,
  amount: number,
): { accountChange: number; toAccountChange: number } {
  switch (type) {
    case TransactionType.INCOME:
      return { accountChange: amount, toAccountChange: 0 };
    case TransactionType.EXPENSE:
      return { accountChange: -amount, toAccountChange: 0 };
    case TransactionType.TRANSFER:
      return { accountChange: -amount, toAccountChange: amount };
    case TransactionType.INVESTMENT:
      return { accountChange: -amount, toAccountChange: 0 };
    case TransactionType.GOAL:
      return { accountChange: -amount, toAccountChange: 0 };
    default:
      return { accountChange: 0, toAccountChange: 0 };
  }
}

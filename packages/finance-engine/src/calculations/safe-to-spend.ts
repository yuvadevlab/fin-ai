/**
 * Safe-to-spend calculations — pure functions.
 */

export interface SafeToSpendInput {
  /** Total liquid balance across active accounts (bank + wallet + cash). */
  liquidBalance: number;
  /** Income recorded so far in the current month. */
  monthIncome: number;
  /** Expenses recorded so far in the current month. */
  monthExpenses: number;
  /** Sum of unspent budget limits: Σ max(0, limit − spent) across active budgets. */
  remainingBudgetCommitments: number;
  /** Planned monthly contributions toward open savings goals (optional). */
  goalCommitments?: number;
}

export interface SafeToSpendResult {
  safeToSpend: number;
  liquidBalance: number;
  netMonthCashFlow: number;
  budgetCommitments: number;
  goalCommitments: number;
}

/**
 * Estimate how much can be safely spent for the rest of the month:
 * liquid balance + month-to-date net cash flow, minus remaining budget
 * commitments and planned goal contributions. Never negative.
 */
export function calculateSafeToSpend(input: SafeToSpendInput): SafeToSpendResult {
  const goalCommitments = input.goalCommitments ?? 0;
  const netMonthCashFlow = input.monthIncome - input.monthExpenses;
  const budgetCommitments = Math.max(0, input.remainingBudgetCommitments);
  const safeToSpend = Math.max(
    0,
    input.liquidBalance + netMonthCashFlow - budgetCommitments - goalCommitments,
  );

  return {
    safeToSpend,
    liquidBalance: input.liquidBalance,
    netMonthCashFlow,
    budgetCommitments,
    goalCommitments,
  };
}

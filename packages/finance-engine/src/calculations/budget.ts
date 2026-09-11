/**
 * Budget calculations — pure functions.
 */

import type { BudgetStatus } from "@finai/shared-types";

/**
 * Budget consumption as a percentage of the limit.
 *
 * Deliberately NOT clamped: exceeding 100% is the signal used by
 * {@link calculateBudgetStatus} to flag OVER budgets, so the raw over-limit
 * value must survive. A non-positive limit yields 0 (no limit = no usage
 * concept; avoids division by zero).
 *
 * @returns Value between 0 and 100+ (can exceed 100 if over budget)
 */
export function calculateBudgetUsage(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((spent / limit) * 100);
}

/**
 * Map usage to the user-facing status pill.
 * Thresholds: >100% OVER, >85% NEAR_LIMIT (early warning to slow down
 * before the month ends), otherwise ON_TRACK. 85% is chosen so a warning
 * appears while there is still roughly a week of typical spending left.
 */
export function calculateBudgetStatus(spent: number, limit: number): BudgetStatus {
  const usage = calculateBudgetUsage(spent, limit);
  if (usage > 100) return "OVER";
  if (usage > 85) return "NEAR_LIMIT";
  return "ON_TRACK";
}

/**
 * Money still available in a budget. Negative when over budget — callers
 * rely on the sign to render "₹X over" states, so do not clamp.
 */
export function calculateBudgetRemaining(spent: number, limit: number): number {
  return limit - spent;
}

export interface AggregateBudgetSummary {
  /** Sum of all budget limits (missing limits count as 0). */
  totalLimit: number;
  /** Sum of all spent amounts (missing values count as 0). */
  totalSpent: number;
  /** Overall consumption percentage, 0–100+ (unclamped; see calculateBudgetUsage). */
  usagePercentage: number;
  /** Status derived from the AGGREGATE totals, not per-budget worst case. */
  status: BudgetStatus;
  /** Aggregate money left; negative when over budget overall. */
  remaining: number;
}

/**
 * Roll many budgets up into one summary line (dashboard "Budgets" card).
 * Optional fields are treated as 0 so partially-hydrated budget lists
 * don't crash aggregation. Note the status reflects the blended total —
 * one heavily-over budget next to several untouched ones can still read
 * ON_TRACK at the aggregate level.
 */
export function calculateAggregateBudget(
  budgets: { limit?: number; spent?: number }[],
): AggregateBudgetSummary {
  const totalLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const usagePercentage = calculateBudgetUsage(totalSpent, totalLimit);
  const status = calculateBudgetStatus(totalSpent, totalLimit);
  const remaining = calculateBudgetRemaining(totalSpent, totalLimit);
  return { totalLimit, totalSpent, usagePercentage, status, remaining };
}

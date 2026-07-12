/**
 * Budget calculations — pure functions.
 */

import type { BudgetStatus } from "@finai/shared-types";

/**
 * Calculate budget usage percentage.
 * @returns Value between 0 and 100+ (can exceed 100 if over budget)
 */
export function calculateBudgetUsage(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((spent / limit) * 100);
}

/**
 * Determine budget status based on usage.
 */
export function calculateBudgetStatus(spent: number, limit: number): BudgetStatus {
  const usage = calculateBudgetUsage(spent, limit);
  if (usage > 100) return "OVER";
  if (usage > 85) return "NEAR_LIMIT";
  return "ON_TRACK";
}

/**
 * Calculate remaining budget amount.
 * Returns negative if over budget.
 */
export function calculateBudgetRemaining(spent: number, limit: number): number {
  return limit - spent;
}

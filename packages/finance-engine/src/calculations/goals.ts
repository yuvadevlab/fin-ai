/**
 * Goal calculations — pure functions.
 */

/**
 * Calculate goal progress as percentage.
 */
export function calculateGoalProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.round((currentAmount / targetAmount) * 100));
}

/**
 * Project when a goal will be completed based on monthly contribution.
 * @returns Estimated months to completion, or null if no progress being made.
 */
export function calculateGoalProjection(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
): number | null {
  if (monthlyContribution <= 0) return null;
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / monthlyContribution);
}

/**
 * Estimate goal completion date based on monthly contribution.
 * @returns ISO date string of estimated completion, or null.
 */
export function estimateGoalCompletion(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
): string | null {
  const months = calculateGoalProjection(currentAmount, targetAmount, monthlyContribution);
  if (months === null) return null;
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split("T")[0];
}

export interface AggregateGoalsSummary {
  totalTarget: number;
  totalCurrent: number;
  progressPercentage: number;
}

/**
 * Aggregate an array of goals into total target, current accumulated, and progress %.
 */
export function calculateAggregateGoals(
  goals: { targetAmount?: number; currentAmount?: number }[],
): AggregateGoalsSummary {
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalCurrent = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const progressPercentage = calculateGoalProgress(totalCurrent, totalTarget);
  return { totalTarget, totalCurrent, progressPercentage };
}

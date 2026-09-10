/**
 * Goal calculations — pure functions.
 */

/**
 * One goal's funding progress as a percentage.
 * A non-positive target yields 0 (avoids division by zero; a goal with no
 * target can't have meaningful progress), and the result is capped at 100
 * so overfunded goals don't skew portfolio-level averages.
 */
export function calculateGoalProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.round((currentAmount / targetAmount) * 100));
}

/**
 * Months remaining to fully fund a goal at a fixed monthly contribution.
 *
 * Returns null when no contribution is being made (infinite projection is
 * meaningless), and 0 when the goal is already funded. `Math.ceil` rounds
 * UP to whole months — "2.3 months" would overstate readiness; the user
 * reaches the goal at the END of the third month, not mid-month.
 *
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
  /** Sum of all goal targets (missing targets count as 0). */
  totalTarget: number;
  /** Sum of all current amounts (missing values count as 0). */
  totalCurrent: number;
  /** Overall funding percentage across all goals, 0–100 (capped). */
  progressPercentage: number;
}

/**
 * Aggregate many goals into one portfolio-level summary (used for the
 * dashboard/goals KPI cards). Per-goal fields are optional and treated as 0
 * so partially-hydrated goal lists don't crash aggregation.
 */
export function calculateAggregateGoals(
  goals: { targetAmount?: number; currentAmount?: number }[],
): AggregateGoalsSummary {
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalCurrent = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const progressPercentage = calculateGoalProgress(totalCurrent, totalTarget);
  return { totalTarget, totalCurrent, progressPercentage };
}

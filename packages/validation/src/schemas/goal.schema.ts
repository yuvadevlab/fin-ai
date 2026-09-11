import { z } from "zod";

/** Enum for the four goal types supported by the app. */
const GoalTypeEnum = z.enum(["EMERGENCY_FUND", "OBLIGATION", "LIFESTYLE", "PERSONAL"]);

/**
 * Validation schema for creating a new financial goal.
 *
 * Goals track progress toward a target amount. The `currentAmount` defaults
 * to 0 and is increased via the contribute endpoint or agent tool.
 */
export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(200),
  targetAmount: z.number().positive("Target amount must be positive"),
  currentAmount: z.number().min(0).default(0),
  deadline: z.string().optional().nullable(),
  type: GoalTypeEnum.default("PERSONAL").optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

/** Partial wrapper of {@link createGoalSchema} — every field optional. */
export const updateGoalSchema = createGoalSchema.partial();

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

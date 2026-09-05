import { z } from "zod";

const GoalTypeEnum = z.enum(["EMERGENCY_FUND", "OBLIGATION", "LIFESTYLE", "PERSONAL"]);

export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(200),
  targetAmount: z.number().positive("Target amount must be positive"),
  currentAmount: z.number().min(0).default(0),
  deadline: z.string().optional().nullable(),
  type: GoalTypeEnum.default("PERSONAL").optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = createGoalSchema.partial();

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

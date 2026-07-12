import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(200),
  targetAmount: z.number().positive("Target amount must be positive"),
  currentAmount: z.number().min(0).default(0),
  deadline: z.string().date("Invalid date format"),
  type: z.enum(["PERSONAL", "FAMILY"]).default("PERSONAL"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = createGoalSchema.partial();

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  limit: z.number().positive("Budget limit must be positive"),
  period: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]).default("MONTHLY"),
  startDate: z.string().date("Invalid date format").optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = createBudgetSchema.partial();

export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

import { z } from "zod";

/**
 * Validation schema for creating a new budget.
 *
 * A budget is uniquely identified by the (user, category) pair in the
 * database, so a category can only have one budget at a time. The
 * `startDate` defaults to the current month in the service layer.
 */
export const createBudgetSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  limit: z.number().positive("Budget limit must be positive"),
  startDate: z.string().date("Invalid date format").optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

/** Partial wrapper of {@link createBudgetSchema} — every field optional. */
export const updateBudgetSchema = createBudgetSchema.partial();

export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

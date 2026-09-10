import { z } from "zod";

/**
 * Schema for creating a new spending/income category.
 * Categories group related transactions (e.g., "Groceries & Supermarket")
 * and are scoped to a group (e.g., "Food & Dining" or "Variable Expenses").
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  group: z.string().max(50, "Group must be less than 50 characters").optional(),
  groupId: z.string().optional(),
  icon: z.string().max(50, "Icon name must be less than 50 characters").nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/** Partial update for categories — all fields optional so callers patch only what changes. */
export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

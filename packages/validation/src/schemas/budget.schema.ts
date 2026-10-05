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

/**
 * Agent-facing budget schemas.
 * Accepts category by name or by ID. The tool layer resolves names to real IDs.
 */
export const agentCreateBudgetSchema = z
  .object({
    category: z.string().min(1, "Category name is required").max(100).optional(),
    categoryId: z.string().min(1, "Category ID is required").max(100).optional(),
    limit: z.number().positive("Budget limit must be positive"),
    startDate: z.string().date("Invalid date format").optional(),
  })
  .refine((v) => v.category !== undefined || v.categoryId !== undefined, {
    message: "Provide a category name or categoryId",
    path: ["category"],
  });

export type AgentCreateBudgetInput = z.infer<typeof agentCreateBudgetSchema>;

export const agentUpdateBudgetSchema = z
  .object({
    budgetId: z.string().min(1).max(100).optional(),
    category: z.string().min(1).max(100).optional(),
    categoryId: z.string().min(1).max(100).optional(),
    limit: z.number().positive("Budget limit must be positive"),
  })
  .refine(
    (v) => v.budgetId !== undefined || v.category !== undefined || v.categoryId !== undefined,
    {
      message: "Provide a budget ID or category name",
      path: ["budgetId"],
    },
  );

export type AgentUpdateBudgetInput = z.infer<typeof agentUpdateBudgetSchema>;

export const agentDeleteBudgetSchema = z
  .object({
    budgetId: z.string().min(1).max(100).optional(),
    category: z.string().min(1).max(100).optional(),
    categoryId: z.string().min(1).max(100).optional(),
  })
  .refine(
    (v) => v.budgetId !== undefined || v.category !== undefined || v.categoryId !== undefined,
    {
      message: "Provide a budget ID or category name",
      path: ["budgetId"],
    },
  );

export type AgentDeleteBudgetInput = z.infer<typeof agentDeleteBudgetSchema>;

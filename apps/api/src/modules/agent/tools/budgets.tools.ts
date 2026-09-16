import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { BudgetsService } from "@/modules/budgets/budgets.service";
import { createBudgetSchema, updateBudgetSchema } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";

/**
 * Read + write tools over the existing BudgetsService. Includes the
 * composite `budgets.transferAllocation` (move limit between budgets) —
 * exposed as a single tool so the model can't propose the two underlying
 * updates separately and leave limits inconsistent on failure.
 */
export function createBudgetsTools(budgetsService: BudgetsService) {
  return [
    defineTool({
      name: "budgets.list",
      description:
        "List the user's budgets with their monthly limits and current spending status (ON_TRACK / NEAR_LIMIT / OVER).",
      access: "read",
      confirmation: "none",
      label: "Reviewing budgets",
      schema: z.object({}),
      execute: async (_input, ctx) => {
        const budgets = await budgetsService.findAll(ctx.userId);
        return { budgets };
      },
      serialize: (output) => {
        const { budgets } = output as {
          budgets: {
            id: string;
            category?: { name: string };
            limit: number;
            spent: number;
            status: string;
          }[];
        };
        return {
          budgets: budgets.map((b) => ({
            id: b.id,
            category: b.category?.name ?? "Category",
            limit: b.limit,
            spent: b.spent,
            status: b.status,
          })),
        };
      },
      summarize: (output) => {
        const { budgets } = output as {
          budgets: { status: string }[];
        };
        const over = budgets.filter((b) => b.status === "OVER").length;
        return `Retrieved ${budgets.length} budget(s)${over > 0 ? ` — ${over} over limit` : ""}`;
      },
    }),
    defineTool({
      name: "budgets.create",
      description:
        "Create a spending budget for one of the user's categories. Requires confirmation. Fields: categoryId (resolve with categories.list or categories.resolve), limit (positive number), optional start date (YYYY-MM-DD, defaults to today).",
      access: "write",
      confirmation: "required",
      label: "Creating budget",
      invalidates: ["budgets", "analytics"],
      schema: createBudgetSchema,
      execute: async (input, ctx) => budgetsService.create(ctx.userId, input),
      describe: (input) => {
        const rows: [string, string][] = [
          ["Category ID", input.categoryId],
          ["Limit", formatINR(input.limit)],
        ];
        rows.push(["Start date", input.startDate ?? "Today"]);
        return { type: "confirmation" as const, title: "Create budget", rows };
      },
      summarize: (output) => {
        const budget = output as { limit: number; category?: { name: string } };
        return `Created budget for ${budget.category?.name ?? "category"} — limit ${formatINR(budget.limit)}`;
      },
    }),
    defineTool({
      name: "budgets.update",
      description:
        "Change a budget's limit. Requires confirmation. Only the limit can be updated; resolve the budget ID with budgets.list first.",
      access: "write",
      confirmation: "required",
      label: "Updating budget limit",
      invalidates: ["budgets", "analytics"],
      schema: updateBudgetSchema
        .omit({ categoryId: true, startDate: true })
        .extend({ budgetId: z.string().uuid("Invalid budget ID") })
        .required({ limit: true }),
      execute: async (input, ctx) => {
        const { budgetId, ...changes } = input;
        return budgetsService.update(budgetId, ctx.userId, changes);
      },
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Update budget",
        rows: [
          ["Budget ID", input.budgetId],
          ["New limit", formatINR(input.limit)],
        ],
      }),
      summarize: () => "Budget limit updated",
    }),
    defineTool({
      name: "budgets.delete",
      description:
        "Permanently delete one of the user's budgets. Requires confirmation — this is destructive; the category itself is not deleted.",
      access: "write",
      confirmation: "required",
      label: "Deleting budget",
      invalidates: ["budgets", "analytics"],
      schema: z.object({
        budgetId: z.string().uuid("Invalid budget ID"),
      }),
      execute: async (input, ctx) => budgetsService.remove(input.budgetId, ctx.userId),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Delete budget",
        rows: [
          ["Budget ID", input.budgetId],
          ["Warning", "Permanent delete — budget tracking for this category stops"],
        ],
      }),
      summarize: () => "Budget deleted",
    }),
    defineTool({
      name: "budgets.transferAllocation",
      description:
        "Composite: move part of one budget's limit to another budget atomically (reduces the source limit, increases the target). Requires confirmation. Resolve both budget IDs with budgets.list first.",
      access: "write",
      confirmation: "required",
      label: "Transferring budget allocation",
      invalidates: ["budgets", "analytics"],
      schema: z.object({
        fromBudgetId: z.string().uuid("Invalid source budget ID"),
        toBudgetId: z.string().uuid("Invalid target budget ID"),
        amount: z.number().positive("Transfer amount must be positive"),
      }),
      execute: async (input, ctx) =>
        budgetsService.transferAllocation(
          ctx.userId,
          input.fromBudgetId,
          input.toBudgetId,
          input.amount,
        ),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Transfer budget allocation",
        rows: [
          ["From budget ID", input.fromBudgetId],
          ["To budget ID", input.toBudgetId],
          ["Amount", formatINR(input.amount)],
        ],
      }),
      summarize: (output) => {
        const budget = output as { limit: number; category?: { name: string } };
        return `Allocation moved — target budget ${budget.category?.name ?? ""} now ${formatINR(budget.limit)}`;
      },
    }),
  ];
}

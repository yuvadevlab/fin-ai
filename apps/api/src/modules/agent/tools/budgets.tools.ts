import { z } from "zod";
import { BadRequestException } from "@nestjs/common";
import { defineTool } from "../tool-factory";
import type { BudgetsService } from "@/modules/budgets/budgets.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import {
  agentCreateBudgetSchema,
  agentUpdateBudgetSchema,
  agentDeleteBudgetSchema,
} from "@finai/validation";
import { formatINR } from "@finai/finance-engine";
import { resolveCategoryRef, splitRef } from "../entity-reference";

async function resolveBudgetMatch(
  budgetsService: BudgetsService,
  categoriesService: CategoriesService,
  userId: string,
  refStr?: string | null,
) {
  if (!refStr) throw new BadRequestException("A budget ID or category name is required");
  const ref = splitRef(refStr) ?? { name: refStr };
  const budgets = await budgetsService.findAll(userId);
  let match = ref.id ? budgets.find((b) => b.id === ref.id) : undefined;
  if (!match) {
    const category = await resolveCategoryRef(categoriesService, userId, ref);
    match = budgets.find((b) => b.categoryId === category.id);
  }
  if (!match) {
    throw new BadRequestException(
      `No budget found matching "${refStr}". List budgets with budgets.list or create one with budgets.create.`,
    );
  }
  return match;
}

/**
 * Read + write tools over the existing BudgetsService.
 * Supports referencing categories by name or ID with auto-resolution.
 */
export function createBudgetsTools(
  budgetsService: BudgetsService,
  categoriesService: CategoriesService,
) {
  return [
    defineTool({
      name: "budgets.list",
      description:
        "List the user's budgets with their monthly limits and current spending status (ON_TRACK / NEAR_LIMIT / AT_LIMIT / OVER).",
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
        "Create a spending budget for one of the user's categories. Requires confirmation. Fields: category (name or ID, e.g. 'Healthcare', 'Groceries'), limit (positive number), optional start date (YYYY-MM-DD).",
      access: "write",
      confirmation: "required",
      label: "Creating budget",
      invalidates: ["budgets", "analytics"],
      schema: agentCreateBudgetSchema,
      resolveInput: async (input, ctx) => {
        const refStr = input.category ?? input.categoryId;
        const category = await resolveCategoryRef(
          categoriesService,
          ctx.userId,
          splitRef(refStr) ?? { name: refStr ?? "" },
          { autoCreate: true },
        );
        return {
          ...input,
          categoryId: category.id,
          category: category.name,
        };
      },
      execute: async (input, ctx) => {
        const categoryId = input.categoryId!;
        const existing = await budgetsService.findAll(ctx.userId);
        const found = existing.find((b) => b.categoryId === categoryId);
        if (found) {
          return budgetsService.update(found.id, ctx.userId, { limit: input.limit });
        }
        return budgetsService.create(ctx.userId, {
          categoryId,
          limit: input.limit,
          startDate: input.startDate,
        });
      },
      describe: (input) => {
        const rows: [string, string][] = [
          ["Category", input.category ?? input.categoryId ?? "Category"],
          ["Limit", formatINR(input.limit)],
          ["Start date", input.startDate ?? "Current month"],
        ];
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
        "Change a budget's spending limit. Requires confirmation. Accepts budgetId OR category name (e.g. 'Groceries', 'Dining Out'), and new limit.",
      access: "write",
      confirmation: "required",
      label: "Updating budget limit",
      invalidates: ["budgets", "analytics"],
      schema: agentUpdateBudgetSchema,
      resolveInput: async (input, ctx) => {
        const match = await resolveBudgetMatch(
          budgetsService,
          categoriesService,
          ctx.userId,
          input.budgetId ?? input.category ?? input.categoryId,
        );
        return { ...input, budgetId: match.id, category: match.category?.name };
      },
      execute: async (input, ctx) =>
        budgetsService.update(input.budgetId!, ctx.userId, { limit: input.limit }),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Update budget",
        rows: [
          ["Category", input.category ?? input.budgetId ?? "Budget"],
          ["New limit", formatINR(input.limit)],
        ],
      }),
      summarize: () => "Budget limit updated",
    }),
    defineTool({
      name: "budgets.delete",
      description:
        "Permanently delete one of the user's budgets. Requires confirmation. Accepts budgetId OR category name.",
      access: "write",
      confirmation: "required",
      label: "Deleting budget",
      invalidates: ["budgets", "analytics"],
      schema: agentDeleteBudgetSchema,
      resolveInput: async (input, ctx) => {
        const match = await resolveBudgetMatch(
          budgetsService,
          categoriesService,
          ctx.userId,
          input.budgetId ?? input.category ?? input.categoryId,
        );
        return { ...input, budgetId: match.id, category: match.category?.name };
      },
      execute: async (input, ctx) => budgetsService.remove(input.budgetId!, ctx.userId),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Delete budget",
        rows: [
          ["Category", input.category ?? input.budgetId ?? "Budget"],
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

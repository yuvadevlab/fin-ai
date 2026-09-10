import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import type { TransactionFilterInput } from "@finai/validation";
import { resolveCategoryRef, splitRef } from "../entity-reference";

const recategorizeSchema = z
  .object({
    filter: z.object({
      category: z.string().optional(),
      account: z.string().optional(),
      type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      search: z.string().max(200).optional(),
    }),
    targetCategoryId: z.string().uuid("Invalid target category ID").optional(),
    targetCategory: z.string().min(1).max(100).optional(),
  })
  .refine((v) => v.targetCategoryId !== undefined || v.targetCategory !== undefined, {
    message: "Provide targetCategory (name) or targetCategoryId",
    path: ["targetCategory"],
  });

type RecategorizeFilter = z.infer<typeof recategorizeSchema>["filter"];
type RecategorizeInput = z.infer<typeof recategorizeSchema>;

/**
 * Map the agent-facing filter to the service-layer filter. Pagination is
 * pinned to a single 100-item page because recategorization operates on the
 * whole matching set in the service.
 */
function toServiceFilter(filter: RecategorizeFilter): TransactionFilterInput {
  return {
    ...(filter.category && { category: filter.category }),
    ...(filter.account && { account: filter.account }),
    ...(filter.type && { type: filter.type }),
    ...(filter.search && { search: filter.search }),
    ...(filter.dateFrom && { dateFrom: filter.dateFrom }),
    ...(filter.dateTo && { dateTo: filter.dateTo }),
    page: 1,
    pageSize: 100,
    sortOrder: "desc",
  };
}

/** Resolve the target category for a re-categorization by name or ID. */
async function resolveTargetCategory(
  categoriesService: CategoriesService,
  userId: string,
  input: RecategorizeInput,
) {
  return resolveCategoryRef(
    categoriesService,
    userId,
    splitRef(input.targetCategory) ?? { id: input.targetCategoryId ?? "" },
    { autoCreate: true },
  );
}

export function createTransactionsRecategorizeTools(
  transactionsService: TransactionsService,
  categoriesService: CategoriesService,
) {
  return [
    defineTool({
      name: "transactions.recategorize",
      description:
        "DRY-RUN ONLY: count the user's transactions matching a filter that would be re-categorized to a target category. Nothing is changed. Run this first, report the matched count to the user, then propose transactions.recategorizeApply for confirmation. targetCategory accepts a category name or ID.",
      access: "read",
      confirmation: "none",
      schema: recategorizeSchema,
      execute: async (input, ctx) => {
        const target = await resolveTargetCategory(categoriesService, ctx.userId, input);
        return transactionsService.recategorize(
          ctx.userId,
          toServiceFilter(input.filter),
          target.id,
          true,
        );
      },
      summarize: (output) => {
        const result = output as { matched: number };
        return `Would re-categorize ${result.matched} transaction(s) (dry-run)`;
      },
    }),
    defineTool({
      name: "transactions.recategorizeApply",
      description:
        "Apply a re-categorization: move ALL transactions matching a filter to a target category, as counted by the transactions.recategorize dry-run. Requires confirmation. Only the category changes — account balances are never touched. targetCategory accepts a category name or ID.",
      access: "write",
      confirmation: "required",
      schema: recategorizeSchema,
      execute: async (input, ctx) => {
        const target = await resolveTargetCategory(categoriesService, ctx.userId, input);
        return transactionsService.recategorize(
          ctx.userId,
          toServiceFilter(input.filter),
          target.id,
          false,
        );
      },
      describe: (input) => {
        const rows: [string, string][] = [
          ["Target category", input.targetCategory ?? input.targetCategoryId ?? "Unresolved"],
        ];
        if (input.filter.category) rows.push(["Current category ID", input.filter.category]);
        if (input.filter.type) rows.push(["Type", input.filter.type]);
        if (input.filter.search) rows.push(["Notes contain", input.filter.search]);
        if (input.filter.dateFrom) rows.push(["From", input.filter.dateFrom]);
        if (input.filter.dateTo) rows.push(["To", input.filter.dateTo]);
        return { type: "confirmation" as const, title: "Re-categorize transactions", rows };
      },
      summarize: (output) => {
        const result = output as { updated: number };
        return `Re-categorized ${result.updated} transaction(s)`;
      },
    }),
  ];
}

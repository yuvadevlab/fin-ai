import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import type { TransactionFilterInput } from "@finai/validation";
import {
  AgentToolName,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
  TransactionType,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS, AGENT_TOOL_TITLES } from "@finai/ai-engine";
import { resolveCategoryRef, splitRef } from "../entity-reference";

const flexibleDateSchema = z
  .string()
  .refine(
    (val) => !isNaN(Date.parse(val)),
    "Invalid date format. Expected YYYY-MM-DD or ISO 8601 datetime",
  );

const recategorizeSchema = z
  .object({
    filter: z.object({
      category: z.string().optional(),
      account: z.string().optional(),
      type: z.nativeEnum(TransactionType).optional(),
      dateFrom: flexibleDateSchema.optional(),
      dateTo: flexibleDateSchema.optional(),
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
      name: AgentToolName.TRANSACTIONS_RECATEGORIZE_PREVIEW,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.TRANSACTIONS_RECATEGORIZE_PREVIEW],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.TRANSACTIONS_RECATEGORIZE_PREVIEW],
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
      name: AgentToolName.TRANSACTIONS_RECATEGORIZE_APPLY,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.TRANSACTIONS_RECATEGORIZE_APPLY],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.TRANSACTIONS_RECATEGORIZE_APPLY],
      invalidates: [
        ToolInvalidationTag.TRANSACTIONS,
        ToolInvalidationTag.CATEGORIES,
        ToolInvalidationTag.ANALYTICS,
      ],
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
          [
            ConfirmationRowLabel.TARGET_CATEGORY,
            input.targetCategory ?? input.targetCategoryId ?? ConfirmationRowLabel.UNRESOLVED,
          ],
        ];
        if (input.filter.category)
          rows.push([ConfirmationRowLabel.CURRENT_CATEGORY_ID, input.filter.category]);
        if (input.filter.type) rows.push([ConfirmationRowLabel.TYPE, input.filter.type]);
        if (input.filter.search)
          rows.push([ConfirmationRowLabel.NOTES_CONTAIN, input.filter.search]);
        if (input.filter.dateFrom) rows.push([ConfirmationRowLabel.FROM, input.filter.dateFrom]);
        if (input.filter.dateTo) rows.push([ConfirmationRowLabel.TO, input.filter.dateTo]);
        return {
          type: "confirmation" as const,
          title: AGENT_TOOL_TITLES[AgentToolName.TRANSACTIONS_RECATEGORIZE_APPLY],
          rows,
        };
      },
      summarize: (output) => {
        const result = output as { updated: number };
        return `Re-categorized ${result.updated} transaction(s)`;
      },
    }),
  ];
}

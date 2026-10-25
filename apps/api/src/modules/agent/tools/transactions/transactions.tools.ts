import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import type { TransactionFilterInput } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";
import {
  AgentToolName,
  ToolAccessLevel,
  ToolConfirmationType,
  TransactionType,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS } from "@finai/ai-engine";
import { TOOL_MESSAGES } from "../tool-messages.constants";

const flexibleDateSchema = z
  .string()
  .refine(
    (val) => !isNaN(Date.parse(val)),
    "Invalid date format. Expected YYYY-MM-DD or ISO 8601 datetime",
  );

/**
 * Read tools over the existing TransactionsService (writes live in
 * transactions.write.tools). The list tool serializes to compact flat rows
 * (category/account names instead of nested objects) because verbose JSON
 * wastes the local model's small context window.
 */
export function createTransactionsTools(transactionsService: TransactionsService) {
  return [
    defineTool({
      name: AgentToolName.TRANSACTIONS_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.TRANSACTIONS_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.TRANSACTIONS_LIST],
      schema: z.object({
        dateFrom: flexibleDateSchema.optional(),
        dateTo: flexibleDateSchema.optional(),
        category: z.string().optional(),
        account: z.string().optional(),
        type: z.nativeEnum(TransactionType).optional(),
        search: z.string().max(200).optional(),
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
      }),
      execute: async (input, ctx) => {
        const filter: TransactionFilterInput = {
          ...(input.dateFrom && { dateFrom: input.dateFrom }),
          ...(input.dateTo && { dateTo: input.dateTo }),
          ...(input.category && { category: input.category }),
          ...(input.account && { account: input.account }),
          ...(input.type && { type: input.type }),
          ...(input.search && { search: input.search }),
          page: input.page,
          pageSize: input.pageSize,
          sortOrder: "desc",
        };
        return transactionsService.findAll(ctx.userId, filter, ctx.workspaceId, ctx.memberUserIds);
      },
      serialize: (output) => {
        const { items, total } = output as {
          items: {
            id: string;
            date: string;
            type: string;
            amount: number;
            category?: { name: string };
            account?: { name: string };
            notes?: string | null;
          }[];
          total: number;
        };
        return {
          total,
          transactions: items.map((t) => ({
            id: t.id,
            date: t.date,
            type: t.type,
            amount: t.amount,
            category: t.category?.name ?? "Uncategorized",
            account: t.account?.name ?? "Unknown",
            notes: t.notes,
          })),
        };
      },
      summarize: (output) => {
        const { total } = output as { total: number };
        return TOOL_MESSAGES.TRANSACTIONS.LISTED(total);
      },
    }),
    defineTool({
      name: AgentToolName.TRANSACTIONS_SUMMARIZE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.TRANSACTIONS_SUMMARIZE],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.TRANSACTIONS_SUMMARIZE],
      schema: z.object({
        dateFrom: flexibleDateSchema.optional(),
        dateTo: flexibleDateSchema.optional(),
        groupBy: z.enum(["category", "type"]).default("category"),
        type: z.nativeEnum(TransactionType).optional(),
      }),
      execute: async (input, ctx) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        ).toISOString();
        return transactionsService.summarize(
          ctx.userId,
          {
            dateFrom: input.dateFrom ?? startOfMonth,
            dateTo: input.dateTo ?? endOfMonth,
            groupBy: input.groupBy,
            ...(input.type && { type: input.type }),
          },
          ctx.workspaceId,
          ctx.memberUserIds,
        );
      },
      summarize: (output) => {
        const groups = output as { key: string; total: number }[];
        const top = groups.slice(0, 3).map((g) => `${g.key}: ${formatINR(g.total)}`);
        return `Summarized ${groups.length} group(s). Top: ${top.join(", ")}`;
      },
    }),
  ];
}

import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import type { TransactionFilterInput } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";

/**
 * Read tools over the existing TransactionsService (writes live in
 * transactions.write.tools). The list tool serializes to compact flat rows
 * (category/account names instead of nested objects) because verbose JSON
 * wastes the local model's small context window.
 */
export function createTransactionsTools(transactionsService: TransactionsService) {
  return [
    defineTool({
      name: "transactions.list",
      description:
        "List the user's transactions with optional filters (date range, category, account, type, search) and pagination. Returns items plus total count.",
      access: "read",
      confirmation: "none",
      label: "Reviewing transactions",
      schema: z.object({
        dateFrom: z.string().datetime().optional(),
        dateTo: z.string().datetime().optional(),
        category: z.string().optional(),
        account: z.string().optional(),
        type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]).optional(),
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
        return transactionsService.findAll(ctx.userId, filter);
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
        return `Found ${total} transaction(s)`;
      },
    }),
    defineTool({
      name: "transactions.summarize",
      description:
        "Aggregate transaction totals over a date range, grouped by category name or transaction type. Useful for spending analysis.",
      access: "read",
      confirmation: "none",
      label: "Summarizing transactions",
      schema: z.object({
        dateFrom: z.string().datetime(),
        dateTo: z.string().datetime(),
        groupBy: z.enum(["category", "type"]).default("category"),
        type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]).optional(),
      }),
      execute: async (input, ctx) =>
        transactionsService.summarize(ctx.userId, {
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          groupBy: input.groupBy,
          ...(input.type && { type: input.type }),
        }),
      summarize: (output) => {
        const groups = output as { key: string; total: number }[];
        const top = groups.slice(0, 3).map((g) => `${g.key}: ${formatINR(g.total)}`);
        return `Summarized ${groups.length} group(s). Top: ${top.join(", ")}`;
      },
    }),
  ];
}

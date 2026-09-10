import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import type { TransactionFilterInput, UpdateTransactionInput } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";
import { agentUpdateTransactionSchema } from "../transactions.agent-schemas";
import {
  checkTransactionRefs,
  resolveAccountRef,
  resolveCategoryRef,
  splitRef,
  type TransactionRefInput,
} from "../entity-reference";
import { resolveAgentTransactionDate } from "../date-expression";

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
 * whole matching set in the service — the filter is passed through, not the
 * page of rows.
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

/**
 * Write tools over the existing TransactionsService (plus the read-only
 * recategorize dry-run preview pairing with the confirmation-gated apply).
 * Account/category references may be names or IDs; they are resolved
 * server-side against the user's real data at execute time.
 *
 * The recategorize pair intentionally shares one schema: the read tool runs
 * with `dryRun: true` (counts only), the write tool with `dryRun: false`
 * (applies). The model is prompted to call the dry-run first so the user
 * sees the blast radius ("24 transactions") on the confirm card.
 */
export function createTransactionsWriteTools(
  transactionsService: TransactionsService,
  accountsService: AccountsService,
  categoriesService: CategoriesService,
) {
  return [
    defineTool({
      // Deliberately a READ tool even though its apply-counterpart is a
      // write: the dry-run lets the model report an exact count in chat
      // before asking the user to confirm the bulk mutation.
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
    defineTool({
      name: "transactions.update",
      description:
        "Update an existing transaction's amount, date, notes, category, accounts or type. Requires confirmation. Balances rebalance automatically. Pass only the fields that should change; account/category accept a name or ID. For dates, follow the same rule as transactions.create: pass the user's wording in dateExpression ('yesterday', 'aug 15'), or set date directly; omit both to leave the date unchanged. Set toAccountId: null to clear a destination account.",
      access: "write",
      confirmation: "required",
      schema: agentUpdateTransactionSchema,
      // Propose-time soft validation: surface "no such category/account"
      // warnings on the confirm card instead of failing after confirm.
      validate: async (input, ctx) => {
        const refInput: TransactionRefInput = {
          account: input.account,
          accountId: input.accountId,
          category: input.category,
          categoryId: input.categoryId,
          toAccount: input.toAccount,
          toAccountId: input.toAccountId,
        };
        const check = await checkTransactionRefs(
          accountsService,
          categoriesService,
          ctx.userId,
          refInput,
        );
        return check.warnings.map((w) => ({ field: w.field, message: w.message }));
      },
      execute: async (input, ctx) => {
        // Destructure reference fields out — they must be resolved to real
        // ownership-checked IDs before the service call; the remaining
        // scalar fields pass straight through as changes.
        const {
          transactionId,
          account,
          accountId,
          category,
          categoryId,
          toAccount,
          toAccountId,
          date,
          dateExpression,
          amount,
          notes,
          type,
        } = input;
        const changes: UpdateTransactionInput = {};
        // Only include fields the model actually supplied — absent keys mean
        // "leave unchanged" to the update service, so spreading everything
        // would accidentally wipe optional fields like notes.
        if (amount !== undefined) changes.amount = amount;
        if (type !== undefined) changes.type = type;
        if (notes !== undefined) changes.notes = notes;
        // Date resolution follows the same precedence as create: the user's
        // verbatim expression wins over an explicit date; omitting both
        // leaves the existing date untouched (no default to today).
        if (date !== undefined || dateExpression !== undefined) {
          changes.date = resolveAgentTransactionDate({ date, dateExpression });
        }
        if (account !== undefined || accountId !== undefined) {
          const ref = await resolveAccountRef(
            accountsService,
            ctx.userId,
            splitRef(account) ?? { id: accountId ?? "" },
          );
          changes.accountId = ref.id;
        }
        if (category !== undefined || categoryId !== undefined) {
          const ref = await resolveCategoryRef(
            categoriesService,
            ctx.userId,
            splitRef(category) ?? { id: categoryId ?? "" },
            { autoCreate: true },
          );
          changes.categoryId = ref.id;
        }
        if (toAccount !== undefined || toAccountId !== undefined) {
          if (toAccountId === null) {
            // Explicit null means "clear the transfer destination"; only an
            // absent field means "don't touch it". Strings still resolve.
            changes.toAccountId = null;
          } else {
            const ref = await resolveAccountRef(
              accountsService,
              ctx.userId,
              splitRef(toAccount) ?? { id: toAccountId ?? "" },
            );
            changes.toAccountId = ref.id;
          }
        }
        return transactionsService.update(transactionId, ctx.userId, changes);
      },
      describe: (input) => {
        const rows: [string, string][] = [["Transaction ID", input.transactionId]];
        if (input.amount !== undefined) rows.push(["Amount", formatINR(input.amount)]);
        if (input.date !== undefined || input.dateExpression !== undefined) {
          try {
            rows.push([
              "Date",
              input.dateExpression
                ? `${resolveAgentTransactionDate({
                    date: input.date,
                    dateExpression: input.dateExpression,
                  })} (${input.dateExpression})`
                : input.date!,
            ]);
          } catch {
            rows.push(["Date", input.date ?? input.dateExpression ?? ""]);
          }
        }
        if (input.type !== undefined) rows.push(["Type", input.type]);
        if (input.category !== undefined) rows.push(["Category", input.category]);
        if (input.categoryId !== undefined) rows.push(["Category ID", input.categoryId]);
        if (input.account !== undefined) rows.push(["Account", input.account]);
        if (input.accountId !== undefined) rows.push(["Account ID", input.accountId]);
        if (input.toAccount !== undefined) rows.push(["To account", input.toAccount]);
        if (input.toAccountId !== undefined)
          rows.push(["To account ID", input.toAccountId ?? "(clear)"]);
        if (input.notes !== undefined) rows.push(["Notes", input.notes ?? ""]);
        return { type: "confirmation" as const, title: "Update transaction", rows };
      },
      summarize: () => "Transaction updated",
    }),
    defineTool({
      name: "transactions.delete",
      description:
        "Permanently delete one of the user's transactions and revert its balance impact. Requires confirmation — this is destructive and cannot be undone.",
      access: "write",
      confirmation: "required",
      schema: z.object({
        transactionId: z.string().uuid("Invalid transaction ID"),
      }),
      execute: async (input, ctx) => transactionsService.remove(input.transactionId, ctx.userId),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Delete transaction",
        rows: [
          ["Transaction ID", input.transactionId],
          ["Warning", "Permanent delete — the balance impact will be reverted"],
        ],
      }),
      summarize: () => "Transaction deleted",
    }),
  ];
}

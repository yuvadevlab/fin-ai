import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import type { UpdateTransactionInput } from "@finai/validation";
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
import { createTransactionsRecategorizeTools } from "./transactions.recategorize.tools";

/**
 * Write tools over the existing TransactionsService:
 * update, delete, and the recategorize preview/apply pair.
 */
export function createTransactionsWriteTools(
  transactionsService: TransactionsService,
  accountsService: AccountsService,
  categoriesService: CategoriesService,
) {
  return [
    ...createTransactionsRecategorizeTools(transactionsService, categoriesService),
    defineTool({
      name: "transactions.update",
      description:
        "Update an existing transaction's amount, date, notes, category, accounts or type. Requires confirmation. Balances rebalance automatically. Pass only the fields that should change; account/category accept a name or ID. For dates, follow the same rule as transactions.create: pass the user's wording in dateExpression ('yesterday', 'aug 15'), or set date directly; omit both to leave the date unchanged. Set toAccountId: null to clear a destination account.",
      access: "write",
      confirmation: "required",
      schema: agentUpdateTransactionSchema,
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
        if (amount !== undefined) changes.amount = amount;
        if (type !== undefined) changes.type = type;
        if (notes !== undefined) changes.notes = notes;
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

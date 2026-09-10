import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import { formatINR } from "@finai/finance-engine";
import { agentCreateTransactionSchema } from "../transactions.agent-schemas";
import { checkTransactionRefs, resolveTransactionRefs } from "../entity-reference";
import { resolveAgentTransactionDate } from "../date-expression";
import { serverTodayISO } from "../date.utils";

/**
 * Format the card-safe date label: resolved YYYY-MM-DD, plus the user's
 * original wording in parentheses so the confirmation card shows exactly
 * what they asked for ("2026-09-04 (yesterday)"). Falls back to the raw
 * phrase when it can't be parsed — the card must render even for input the
 * schema somehow let through, rather than throwing during describe().
 */
function dateLabel(input: { date?: string; dateExpression?: string }): string {
  try {
    const resolved = resolveAgentTransactionDate({
      date: input.date,
      dateExpression: input.dateExpression,
    });
    return input.dateExpression ? `${resolved} (${input.dateExpression})` : resolved;
  } catch {
    return input.date ?? input.dateExpression ?? serverTodayISO();
  }
}

/**
 * Transaction "record" write tools (create + bulkCreate). Kept separate from
 * transactions.write.tools.ts so no API tool file exceeds the 250-line rule.
 * Account/category references may be names or IDs and are resolved
 * server-side against the user's real data at execute time.
 */
export function createTransactionRecordTools(
  transactionsService: TransactionsService,
  accountsService: AccountsService,
  categoriesService: CategoriesService,
) {
  return [
    defineTool({
      name: "transactions.create",
      description:
        "Record a new transaction for the user. Requires confirmation. Fields: amount (positive number), type (INCOME | EXPENSE | TRANSFER | INVESTMENT), account (HDFC account name or accountId), category (e.g. 'groceries' resolving to 'Groceries & Supermarket', or categoryId), optional toAccount (required for TRANSFER), optional notes (max 500 chars). Date: if the user names a date (e.g. 'yesterday', '2 days back', 'aug 15', 'tomorrow', 'last week'), extract that phrase verbatim into dateExpression and also set date to the best-matching YYYY-MM-DD; if the user gives NO date, OMIT date and dateExpression entirely (the server records today). Category and account are resolved to the user's real records server-side — never invent IDs. Account balances update automatically.",
      access: "write",
      confirmation: "required",
      schema: agentCreateTransactionSchema,
      validate: async (input, ctx) => {
        const check = await checkTransactionRefs(
          accountsService,
          categoriesService,
          ctx.userId,
          input,
        );
        return check.warnings.map((w) => ({ field: w.field, message: w.message }));
      },
      resolveInput: async (input, ctx) => {
        // If the user didn't specify an account, resolve the default account
        // so it's visible on the confirmation card AND stored as part of the
        // action input (the user sees exactly what will be used before confirming).
        if (!input.account && !input.accountId) {
          const accounts = await accountsService.findAll(ctx.userId);
          const defaultAccount = accounts.find((a) => a.isDefault);
          if (defaultAccount) {
            return { ...input, accountId: defaultAccount.id };
          }
        }
        return input;
      },
      execute: async (input, ctx) => {
        // On confirm: if a category name doesn't resolve, auto-create it so
        // the transaction can proceed (the user saw the warning and confirmed).
        const refs = await resolveTransactionRefs(
          accountsService,
          categoriesService,
          ctx.userId,
          input,
          { autoCreateCategory: true },
        );
        return transactionsService.create(ctx.userId, {
          ...refs,
          amount: input.amount,
          // Date precedence: user's verbatim wording (deterministic parser)
          // → explicit date → today when the user named no date at all.
          date: resolveAgentTransactionDate({
            date: input.date,
            dateExpression: input.dateExpression,
          }),
          notes: input.notes ?? null,
          type: input.type,
        });
      },
      serialize: (output) => {
        const tx = output as {
          id: string;
          type: string;
          amount: number;
          category?: { name: string };
          account?: { name: string };
        };
        return {
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          category: tx.category?.name,
          account: tx.account?.name,
        };
      },
      describe: (input) => {
        const rows: [string, string][] = [
          ["Type", input.type],
          ["Amount", formatINR(input.amount)],
          ["Date", dateLabel(input)],
          ["Account", input.account ?? input.accountId ?? "Unresolved"],
          ["Category", input.category ?? input.categoryId ?? "Unresolved"],
        ];
        if (input.toAccount ?? input.toAccountId) {
          rows.push(["To account", input.toAccount ?? input.toAccountId ?? ""]);
        }
        if (input.notes) rows.push(["Notes", input.notes]);
        return { type: "confirmation" as const, title: "Record transaction", rows };
      },
      summarize: (output) => {
        const tx = output as { amount: number; type: string };
        return `Recorded ${tx.type.toLowerCase()} of ${formatINR(tx.amount)}`;
      },
    }),
    defineTool({
      name: "transactions.bulkCreate",
      description:
        "Record multiple transactions in one atomic batch (max 25). Requires confirmation. Each item uses the same fields as transactions.create (account/category accept names or IDs; if the user names a date, pass it verbatim in dateExpression; OMIT date/dateExpression when no date is given so the server records today). Use for import-style requests like 'add these three expenses'.",
      access: "write",
      confirmation: "required",
      schema: z.object({
        transactions: z
          .array(agentCreateTransactionSchema)
          .min(1, "At least one transaction is required")
          .max(25, "Bulk create is limited to 25 transactions at a time"),
      }),
      validate: async (input, ctx) => {
        // Validate every item so the confirm card shows ALL problems at once
        // ("#2 Account: no match") instead of one failure per retry round-trip.
        const allWarnings: { field: string; message: string }[] = [];
        for (let i = 0; i < input.transactions.length; i++) {
          const check = await checkTransactionRefs(
            accountsService,
            categoriesService,
            ctx.userId,
            input.transactions[i],
          );
          for (const w of check.warnings) {
            allWarnings.push({ field: `#${i + 1} ${w.field}`, message: w.message });
          }
        }
        return allWarnings;
      },
      execute: async (input, ctx) => {
        // Sequential, not Promise.all: each item may auto-create a category,
        // and parallel runs could create duplicate categories for the same
        // unresolved name. Slower but deterministic and safe.
        const created = [];
        for (const item of input.transactions) {
          const refs = await resolveTransactionRefs(
            accountsService,
            categoriesService,
            ctx.userId,
            item,
            { autoCreateCategory: true },
          );
          created.push(
            await transactionsService.create(ctx.userId, {
              ...refs,
              amount: item.amount,
              date: resolveAgentTransactionDate({
                date: item.date,
                dateExpression: item.dateExpression,
              }),
              notes: item.notes ?? null,
              type: item.type,
            }),
          );
        }
        return created;
      },
      serialize: (output) => {
        const created = output as { id: string }[];
        return { count: created.length, ids: created.map((t) => t.id) };
      },
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Record multiple transactions",
        rows: [
          ["Count", String(input.transactions.length)],
          [
            "Total (absolute)",
            formatINR(input.transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)),
          ],
        ],
      }),
      summarize: (output) => {
        const created = output as unknown[];
        return `Recorded ${created.length} transaction(s)`;
      },
    }),
  ];
}

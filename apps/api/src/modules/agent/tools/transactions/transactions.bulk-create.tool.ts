/**
 * @file apps/api/src/modules/agent/tools/transactions.bulk-create.tool.ts
 * @description Bulk transaction creation tool definition for FinAI agent.
 * @module @finai/api/agent/tools/transactions-bulk-create
 */

import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import { formatINR } from "@finai/finance-engine";
import {
  AgentCardType,
  AgentToolName,
  BULK_ITEM_PREFIX,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS } from "@finai/ai-engine";
import { agentCreateTransactionSchema } from "../../transactions.agent-schemas";
import { checkTransactionRefs, resolveTransactionRefs } from "../../entity-reference";
import { resolveAgentTransactionDate } from "../../date-expression";
import { dateLabel } from "./transactions.date-label";
import { TOOL_MESSAGES } from "../tool-messages.constants";

export function createTransactionBulkCreateTool(
  transactionsService: TransactionsService,
  accountsService: AccountsService,
  categoriesService: CategoriesService,
) {
  return defineTool({
    name: AgentToolName.TRANSACTIONS_BULK_CREATE,
    description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.TRANSACTIONS_BULK_CREATE],
    access: ToolAccessLevel.WRITE,
    confirmation: ToolConfirmationType.REQUIRED,
    label: AGENT_TOOL_LABELS[AgentToolName.TRANSACTIONS_BULK_CREATE],
    invalidates: [
      ToolInvalidationTag.TRANSACTIONS,
      ToolInvalidationTag.ACCOUNTS,
      ToolInvalidationTag.ANALYTICS,
      ToolInvalidationTag.BUDGETS,
    ],
    schema: z.object({
      transactions: z
        .array(agentCreateTransactionSchema)
        .min(1, "At least one transaction is required")
        .max(25, "Bulk create is limited to 25 transactions at a time"),
    }),
    validate: async (input, ctx) => {
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
      type: AgentCardType.BULK_CONFIRMATION,
      title: `Record ${input.transactions.length} transactions`,
      rows: [
        [ConfirmationRowLabel.BULK_COUNT, String(input.transactions.length)],
        [
          ConfirmationRowLabel.BULK_TOTAL,
          formatINR(input.transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)),
        ],
        ...input.transactions.flatMap((tx, i): [string, string][] => [
          [`${BULK_ITEM_PREFIX}${i}__`, "start"],
          [ConfirmationRowLabel.TYPE, tx.type],
          [ConfirmationRowLabel.AMOUNT, formatINR(tx.amount)],
          [ConfirmationRowLabel.DATE, dateLabel(tx)],
          [
            ConfirmationRowLabel.ACCOUNT,
            tx.account ?? tx.accountId ?? ConfirmationRowLabel.DEFAULT,
          ],
          [
            ConfirmationRowLabel.CATEGORY,
            tx.category ?? tx.categoryId ?? ConfirmationRowLabel.UNRESOLVED,
          ],
          ...(tx.toAccount
            ? [[ConfirmationRowLabel.TO_ACCOUNT, tx.toAccount] as [string, string]]
            : []),
          ...(tx.notes ? [[ConfirmationRowLabel.NOTES, tx.notes] as [string, string]] : []),
        ]),
      ],
    }),
    summarize: (output) => {
      const created = output as unknown[];
      return TOOL_MESSAGES.TRANSACTIONS.BULK_CREATED(created.length);
    },
  });
}

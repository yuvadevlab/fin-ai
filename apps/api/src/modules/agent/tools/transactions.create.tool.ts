/**
 * @file apps/api/src/modules/agent/tools/transactions.create.tool.ts
 * @description Single transaction creation tool definition for FinAI agent.
 * @module @finai/api/agent/tools/transactions-create
 */

import { defineTool } from "../tool-factory";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import { formatINR } from "@finai/finance-engine";
import {
  AgentToolName,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS, AGENT_TOOL_TITLES } from "@finai/ai-engine";
import { agentCreateTransactionSchema } from "../transactions.agent-schemas";
import { checkTransactionRefs, resolveTransactionRefs } from "../entity-reference";
import { resolveAgentTransactionDate } from "../date-expression";
import { dateLabel } from "./transactions.date-label";

export function createTransactionCreateTool(
  transactionsService: TransactionsService,
  accountsService: AccountsService,
  categoriesService: CategoriesService,
) {
  return defineTool({
    name: AgentToolName.TRANSACTIONS_CREATE,
    description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.TRANSACTIONS_CREATE],
    access: ToolAccessLevel.WRITE,
    confirmation: ToolConfirmationType.REQUIRED,
    label: AGENT_TOOL_LABELS[AgentToolName.TRANSACTIONS_CREATE],
    invalidates: [
      ToolInvalidationTag.TRANSACTIONS,
      ToolInvalidationTag.ACCOUNTS,
      ToolInvalidationTag.ANALYTICS,
      ToolInvalidationTag.BUDGETS,
    ],
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
        [ConfirmationRowLabel.TYPE, input.type],
        [ConfirmationRowLabel.AMOUNT, formatINR(input.amount)],
        [ConfirmationRowLabel.DATE, dateLabel(input)],
        [
          ConfirmationRowLabel.ACCOUNT,
          input.account ?? input.accountId ?? ConfirmationRowLabel.UNRESOLVED,
        ],
        [
          ConfirmationRowLabel.CATEGORY,
          input.category ?? input.categoryId ?? ConfirmationRowLabel.UNRESOLVED,
        ],
      ];
      if (input.toAccount ?? input.toAccountId) {
        rows.push([ConfirmationRowLabel.TO_ACCOUNT, input.toAccount ?? input.toAccountId ?? ""]);
      }
      if (input.notes) rows.push([ConfirmationRowLabel.NOTES, input.notes]);
      return {
        type: "confirmation" as const,
        title: AGENT_TOOL_TITLES[AgentToolName.TRANSACTIONS_CREATE],
        rows,
      };
    },
    summarize: (output) => {
      const tx = output as { amount: number; type: string };
      return `Recorded ${tx.type.toLowerCase()} of ${formatINR(tx.amount)}`;
    },
  });
}

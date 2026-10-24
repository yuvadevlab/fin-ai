import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import type { UpdateTransactionInput } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";
import {
  AgentCardType,
  AgentToolName,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS, AGENT_TOOL_TITLES } from "@finai/ai-engine";
import { agentUpdateTransactionSchema } from "../../transactions.agent-schemas";
import {
  checkTransactionRefs,
  resolveAccountRef,
  resolveCategoryRef,
  splitRef,
  type TransactionRefInput,
} from "../../entity-reference";
import { resolveAgentTransactionDate } from "../../date-expression";
import { createTransactionsRecategorizeTools } from "./transactions.recategorize.tools";
import { TOOL_MESSAGES } from "../tool-messages.constants";

const INVALIDATES_TRANSACTION_WRITES = [
  ToolInvalidationTag.TRANSACTIONS,
  ToolInvalidationTag.ACCOUNTS,
  ToolInvalidationTag.ANALYTICS,
  ToolInvalidationTag.BUDGETS,
];

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
      name: AgentToolName.TRANSACTIONS_UPDATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.TRANSACTIONS_UPDATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.TRANSACTIONS_UPDATE],
      invalidates: INVALIDATES_TRANSACTION_WRITES,
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
        const rows: [string, string][] = [
          [ConfirmationRowLabel.TRANSACTION_ID, input.transactionId],
        ];
        if (input.amount !== undefined)
          rows.push([ConfirmationRowLabel.AMOUNT, formatINR(input.amount)]);
        if (input.date !== undefined || input.dateExpression !== undefined) {
          try {
            rows.push([
              ConfirmationRowLabel.DATE,
              input.dateExpression
                ? `${resolveAgentTransactionDate({
                    date: input.date,
                    dateExpression: input.dateExpression,
                  })} (${input.dateExpression})`
                : input.date!,
            ]);
          } catch {
            rows.push([ConfirmationRowLabel.DATE, input.date ?? input.dateExpression ?? ""]);
          }
        }
        if (input.type !== undefined) rows.push([ConfirmationRowLabel.TYPE, input.type]);
        if (input.category !== undefined)
          rows.push([ConfirmationRowLabel.CATEGORY, input.category]);
        if (input.categoryId !== undefined)
          rows.push([ConfirmationRowLabel.CATEGORY_ID, input.categoryId]);
        if (input.account !== undefined) rows.push([ConfirmationRowLabel.ACCOUNT, input.account]);
        if (input.accountId !== undefined)
          rows.push([ConfirmationRowLabel.ACCOUNT_ID, input.accountId]);
        if (input.toAccount !== undefined)
          rows.push([ConfirmationRowLabel.TO_ACCOUNT, input.toAccount]);
        if (input.toAccountId !== undefined)
          rows.push([ConfirmationRowLabel.TO_ACCOUNT_ID, input.toAccountId ?? "(clear)"]);
        if (input.notes !== undefined) rows.push([ConfirmationRowLabel.NOTES, input.notes ?? ""]);
        return {
          type: AgentCardType.CONFIRMATION,
          title: AGENT_TOOL_TITLES[AgentToolName.TRANSACTIONS_UPDATE],
          rows,
        };
      },
      summarize: (output) => {
        const tx = output as { id: string };
        return TOOL_MESSAGES.TRANSACTIONS.UPDATED(tx.id);
      },
    }),
    defineTool({
      name: AgentToolName.TRANSACTIONS_DELETE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.TRANSACTIONS_DELETE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.TRANSACTIONS_DELETE],
      invalidates: INVALIDATES_TRANSACTION_WRITES,
      schema: z.object({
        transactionId: z.string().uuid("Invalid transaction ID"),
      }),
      execute: async (input, ctx) => transactionsService.remove(input.transactionId, ctx.userId),
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.TRANSACTIONS_DELETE],
        rows: [
          [ConfirmationRowLabel.TRANSACTION_ID, input.transactionId],
          [ConfirmationRowLabel.WARNING, "Permanent delete — the balance impact will be reverted"],
        ],
      }),
      summarize: () => TOOL_MESSAGES.TRANSACTIONS.DELETED(),
    }),
  ];
}

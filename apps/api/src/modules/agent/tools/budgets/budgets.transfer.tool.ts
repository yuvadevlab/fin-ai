/**
 * @file apps/api/src/modules/agent/tools/budgets.transfer.tool.ts
 * @description Transfer budget allocation tool for FinAI agent.
 * @module @finai/api/agent/tools/budgets-transfer
 */

import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { BudgetsService } from "@/modules/budgets/budgets.service";
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

export function createBudgetTransferTool(budgetsService: BudgetsService) {
  return defineTool({
    name: AgentToolName.BUDGETS_TRANSFER_ALLOCATION,
    description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.BUDGETS_TRANSFER_ALLOCATION],
    access: ToolAccessLevel.WRITE,
    confirmation: ToolConfirmationType.REQUIRED,
    label: AGENT_TOOL_LABELS[AgentToolName.BUDGETS_TRANSFER_ALLOCATION],
    invalidates: [ToolInvalidationTag.BUDGETS, ToolInvalidationTag.ANALYTICS],
    schema: z.object({
      fromBudgetId: z.string().uuid("Invalid source budget ID"),
      toBudgetId: z.string().uuid("Invalid target budget ID"),
      amount: z.number().positive("Transfer amount must be positive"),
    }),
    execute: async (input, ctx) =>
      budgetsService.transferAllocation(
        ctx.userId,
        input.fromBudgetId,
        input.toBudgetId,
        input.amount,
      ),
    describe: (input) => ({
      type: AgentCardType.CONFIRMATION,
      title: AGENT_TOOL_TITLES[AgentToolName.BUDGETS_TRANSFER_ALLOCATION],
      rows: [
        [ConfirmationRowLabel.FROM_BUDGET_ID, input.fromBudgetId],
        [ConfirmationRowLabel.TO_BUDGET_ID, input.toBudgetId],
        [ConfirmationRowLabel.AMOUNT, formatINR(input.amount)],
      ],
    }),
    summarize: (output) => {
      const budget = output as { limit: number; category?: { name: string } };
      return `Allocation moved — target budget ${budget.category?.name ?? ""} now ${formatINR(budget.limit)}`;
    },
  });
}

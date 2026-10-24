/**
 * @file apps/api/src/modules/agent/tools/budgets.tools.ts
 * @description Read + write tools over the BudgetsService.
 * @module @finai/api/agent/tools/budgets
 */

import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { BudgetsService } from "@/modules/budgets/budgets.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import {
  agentCreateBudgetSchema,
  agentUpdateBudgetSchema,
  agentDeleteBudgetSchema,
} from "@finai/validation";
import { formatINR } from "@finai/finance-engine";
import {
  AgentCardType,
  AgentToolName,
  BudgetStatus,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS, AGENT_TOOL_TITLES } from "@finai/ai-engine";
import { resolveCategoryRef, splitRef } from "../../entity-reference";
import { resolveBudgetMatch } from "./budgets.resolve";
import { createBudgetTransferTool } from "./budgets.transfer.tool";
import { TOOL_MESSAGES } from "../tool-messages.constants";

export function createBudgetsTools(
  budgetsService: BudgetsService,
  categoriesService: CategoriesService,
) {
  return [
    defineTool({
      name: AgentToolName.BUDGETS_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.BUDGETS_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.BUDGETS_LIST],
      schema: z.object({}),
      execute: async (_input, ctx) => {
        const budgets = await budgetsService.findAll(ctx.userId);
        return { budgets };
      },
      serialize: (output) => {
        const { budgets } = output as {
          budgets: {
            id: string;
            category?: { name: string };
            limit: number;
            spent: number;
            status: string;
          }[];
        };
        return {
          budgets: budgets.map((b) => ({
            id: b.id,
            category: b.category?.name ?? "Category",
            limit: b.limit,
            spent: b.spent,
            status: b.status,
          })),
        };
      },
      summarize: (output) => {
        const { budgets } = output as {
          budgets: { status: string }[];
        };
        const over = budgets.filter((b) => b.status === BudgetStatus.OVER).length;
        return TOOL_MESSAGES.BUDGETS.LISTED(budgets.length, over);
      },
    }),
    defineTool({
      name: AgentToolName.BUDGETS_CREATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.BUDGETS_CREATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.BUDGETS_CREATE],
      invalidates: [ToolInvalidationTag.BUDGETS, ToolInvalidationTag.ANALYTICS],
      schema: agentCreateBudgetSchema,
      resolveInput: async (input, ctx) => {
        const refStr = input.category ?? input.categoryId;
        const category = await resolveCategoryRef(
          categoriesService,
          ctx.userId,
          splitRef(refStr) ?? { name: refStr ?? "" },
          { autoCreate: true },
        );
        return {
          ...input,
          categoryId: category.id,
          category: category.name,
        };
      },
      execute: async (input, ctx) => {
        const categoryId = input.categoryId!;
        const existing = await budgetsService.findAll(ctx.userId);
        const found = existing.find((b) => b.categoryId === categoryId);
        if (found) {
          return budgetsService.update(found.id, ctx.userId, { limit: input.limit });
        }
        return budgetsService.create(ctx.userId, {
          categoryId,
          limit: input.limit,
          startDate: input.startDate,
        });
      },
      describe: (input) => {
        const rows: [string, string][] = [
          [
            ConfirmationRowLabel.CATEGORY,
            input.category ?? input.categoryId ?? ConfirmationRowLabel.CATEGORY,
          ],
          [ConfirmationRowLabel.LIMIT, formatINR(input.limit)],
          [ConfirmationRowLabel.START_DATE, input.startDate ?? "Current month"],
        ];
        return {
          type: AgentCardType.CONFIRMATION,
          title: AGENT_TOOL_TITLES[AgentToolName.BUDGETS_CREATE],
          rows,
        };
      },
      summarize: (output) => {
        const budget = output as { limit: number; category?: { name: string } };
        return `Created budget for ${budget.category?.name ?? "category"} — limit ${formatINR(budget.limit)}`;
      },
    }),
    defineTool({
      name: AgentToolName.BUDGETS_UPDATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.BUDGETS_UPDATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.BUDGETS_UPDATE],
      invalidates: [ToolInvalidationTag.BUDGETS, ToolInvalidationTag.ANALYTICS],
      schema: agentUpdateBudgetSchema,
      resolveInput: async (input, ctx) => {
        const match = await resolveBudgetMatch(
          budgetsService,
          categoriesService,
          ctx.userId,
          input.budgetId ?? input.category ?? input.categoryId,
        );
        return { ...input, budgetId: match.id, category: match.category?.name };
      },
      execute: async (input, ctx) =>
        budgetsService.update(input.budgetId!, ctx.userId, { limit: input.limit }),
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.BUDGETS_UPDATE],
        rows: [
          [ConfirmationRowLabel.CATEGORY, input.category ?? input.budgetId ?? "Budget"],
          [ConfirmationRowLabel.NEW_LIMIT, formatINR(input.limit)],
        ],
      }),
      summarize: () => "Budget limit updated",
    }),
    defineTool({
      name: AgentToolName.BUDGETS_DELETE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.BUDGETS_DELETE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.BUDGETS_DELETE],
      invalidates: [ToolInvalidationTag.BUDGETS, ToolInvalidationTag.ANALYTICS],
      schema: agentDeleteBudgetSchema,
      resolveInput: async (input, ctx) => {
        const match = await resolveBudgetMatch(
          budgetsService,
          categoriesService,
          ctx.userId,
          input.budgetId ?? input.category ?? input.categoryId,
        );
        return { ...input, budgetId: match.id, category: match.category?.name };
      },
      execute: async (input, ctx) => budgetsService.remove(input.budgetId!, ctx.userId),
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.BUDGETS_DELETE],
        rows: [
          [ConfirmationRowLabel.CATEGORY, input.category ?? input.budgetId ?? "Budget"],
          [
            ConfirmationRowLabel.WARNING,
            "Permanent delete — budget tracking for this category stops",
          ],
        ],
      }),
      summarize: () => "Budget deleted",
    }),
    createBudgetTransferTool(budgetsService),
  ];
}

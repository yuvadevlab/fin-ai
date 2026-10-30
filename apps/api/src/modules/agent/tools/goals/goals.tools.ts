import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { GoalsService } from "@/modules/goals/goals.service";
import { createGoalSchema, updateGoalSchema, contributeAmountSchema } from "@finai/validation";
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

const INVALIDATES_GOAL_WRITES = [
  ToolInvalidationTag.GOALS,
  ToolInvalidationTag.ACCOUNTS,
  ToolInvalidationTag.ANALYTICS,
];

/**
 * Read + write tools over the existing GoalsService. `goals.contribute`
 * only updates the goal's saved amount (bookkeeping) — it intentionally does
 * NOT touch account balances, because a real contribution is recorded as a
 * transaction by the user.
 */
export function createGoalsTools(goalsService: GoalsService) {
  return [
    defineTool({
      name: AgentToolName.GOALS_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.GOALS_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.GOALS_LIST],
      schema: z.object({}),
      execute: async (_input, ctx) => {
        const goals = await goalsService.findAll(ctx.userId, ctx.workspaceId, ctx.memberUserIds);
        return { goals };
      },
      serialize: (output) => {
        const { goals } = output as {
          goals: {
            id: string;
            name: string;
            targetAmount: number;
            currentAmount: number;
            progress: number;
            deadline?: string | null;
            type?: string;
          }[];
        };
        return {
          goals: goals.map((g) => ({
            id: g.id,
            name: g.name,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            progress: g.progress,
            deadline: g.deadline,
            type: g.type,
          })),
        };
      },
      summarize: (output) => {
        const { goals } = output as { goals: { targetAmount: number }[] };
        const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
        return `Retrieved ${goals.length} goal(s), total target ${formatINR(totalTarget)}`;
      },
    }),
    defineTool({
      name: AgentToolName.GOALS_CREATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.GOALS_CREATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.GOALS_CREATE],
      invalidates: INVALIDATES_GOAL_WRITES,
      schema: createGoalSchema,
      execute: async (input, ctx) => goalsService.create(ctx.userId, input),
      describe: (input) => {
        const rows: [string, string][] = [
          [ConfirmationRowLabel.NAME, input.name],
          [ConfirmationRowLabel.TARGET, formatINR(input.targetAmount)],
          [ConfirmationRowLabel.ALREADY_SAVED, formatINR(input.currentAmount ?? 0)],
        ];
        if (input.deadline) rows.push([ConfirmationRowLabel.DEADLINE, input.deadline]);
        if (input.type) rows.push([ConfirmationRowLabel.TYPE, input.type]);
        return {
          type: AgentCardType.CONFIRMATION,
          title: AGENT_TOOL_TITLES[AgentToolName.GOALS_CREATE],
          rows,
        };
      },
      summarize: (output) => {
        const goal = output as { name: string; targetAmount: number };
        return `Created goal ${goal.name} — target ${formatINR(goal.targetAmount)}`;
      },
    }),
    defineTool({
      name: AgentToolName.GOALS_UPDATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.GOALS_UPDATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.GOALS_UPDATE],
      invalidates: INVALIDATES_GOAL_WRITES,
      schema: updateGoalSchema.extend({
        goalId: z.string().uuid("Invalid goal ID"),
      }),
      execute: async (input, ctx) => {
        const { goalId, ...changes } = input;
        return goalsService.update(goalId, ctx.userId, changes);
      },
      describe: (input) => {
        const rows: [string, string][] = [[ConfirmationRowLabel.GOAL_ID, input.goalId]];
        if (input.name !== undefined) rows.push([ConfirmationRowLabel.NAME, input.name]);
        if (input.targetAmount !== undefined)
          rows.push([ConfirmationRowLabel.TARGET, formatINR(input.targetAmount)]);
        if (input.currentAmount !== undefined)
          rows.push([ConfirmationRowLabel.SAVED, formatINR(input.currentAmount)]);
        if (input.deadline !== undefined)
          rows.push([ConfirmationRowLabel.DEADLINE, input.deadline ?? "(none)"]);
        if (input.type !== undefined) rows.push([ConfirmationRowLabel.TYPE, input.type]);
        return {
          type: AgentCardType.CONFIRMATION,
          title: AGENT_TOOL_TITLES[AgentToolName.GOALS_UPDATE],
          rows,
        };
      },
      summarize: (output) => `Updated goal ${(output as { name: string }).name}`,
    }),
    defineTool({
      name: AgentToolName.GOALS_CONTRIBUTE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.GOALS_CONTRIBUTE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.GOALS_CONTRIBUTE],
      invalidates: INVALIDATES_GOAL_WRITES,
      schema: contributeAmountSchema.extend({
        goalId: z.string().uuid("Invalid goal ID"),
      }),
      execute: async (input, ctx) =>
        goalsService.contribute(input.goalId, ctx.userId, input.amount),
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.GOALS_CONTRIBUTE],
        rows: [
          [ConfirmationRowLabel.GOAL_ID, input.goalId],
          [ConfirmationRowLabel.AMOUNT, formatINR(input.amount)],
        ],
      }),
      summarize: (output) => {
        const goal = output as { currentAmount: number };
        return `Contribution recorded — saved so far ${formatINR(goal.currentAmount)}`;
      },
    }),
    defineTool({
      name: AgentToolName.GOALS_DELETE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.GOALS_DELETE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.GOALS_DELETE],
      invalidates: INVALIDATES_GOAL_WRITES,
      schema: z.object({
        goalId: z.string().uuid("Invalid goal ID"),
      }),
      execute: async (input, ctx) => goalsService.remove(input.goalId, ctx.userId),
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.GOALS_DELETE],
        rows: [
          [ConfirmationRowLabel.GOAL_ID, input.goalId],
          [
            ConfirmationRowLabel.WARNING,
            "Permanent delete — progress tracking for this goal is lost",
          ],
        ],
      }),
      summarize: () => "Goal deleted",
    }),
  ];
}

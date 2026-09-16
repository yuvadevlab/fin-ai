import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { GoalsService } from "@/modules/goals/goals.service";
import { createGoalSchema, updateGoalSchema, contributeAmountSchema } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";

/**
 * Read + write tools over the existing GoalsService. `goals.contribute`
 * only updates the goal's saved amount (bookkeeping) — it intentionally does
 * NOT touch account balances, because a real contribution is recorded as a
 * transaction by the user.
 */
export function createGoalsTools(goalsService: GoalsService) {
  return [
    defineTool({
      name: "goals.list",
      description: "List the user's savings goals with progress percentage and deadlines.",
      access: "read",
      confirmation: "none",
      label: "Reviewing goals",
      schema: z.object({}),
      execute: async (_input, ctx) => {
        const goals = await goalsService.findAll(ctx.userId);
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
      name: "goals.create",
      description:
        "Create a savings goal for the user. Requires confirmation. Fields: name, targetAmount, optional currentAmount already saved (defaults 0), optional deadline (date string), optional type (EMERGENCY_FUND | OBLIGATION | LIFESTYLE | PERSONAL).",
      access: "write",
      confirmation: "required",
      label: "Creating savings goal",
      invalidates: ["goals", "accounts", "analytics"],
      schema: createGoalSchema,
      execute: async (input, ctx) => goalsService.create(ctx.userId, input),
      describe: (input) => {
        const rows: [string, string][] = [
          ["Name", input.name],
          ["Target", formatINR(input.targetAmount)],
          ["Already saved", formatINR(input.currentAmount ?? 0)],
        ];
        if (input.deadline) rows.push(["Deadline", input.deadline]);
        if (input.type) rows.push(["Type", input.type]);
        return { type: "confirmation" as const, title: "Create goal", rows };
      },
      summarize: (output) => {
        const goal = output as { name: string; targetAmount: number };
        return `Created goal ${goal.name} — target ${formatINR(goal.targetAmount)}`;
      },
    }),
    defineTool({
      name: "goals.update",
      description:
        "Update a goal's name, target amount, saved amount, deadline or type. Requires confirmation. Only pass the fields that should change.",
      access: "write",
      confirmation: "required",
      label: "Updating savings goal",
      invalidates: ["goals", "accounts", "analytics"],
      schema: updateGoalSchema.extend({
        goalId: z.string().uuid("Invalid goal ID"),
      }),
      execute: async (input, ctx) => {
        const { goalId, ...changes } = input;
        return goalsService.update(goalId, ctx.userId, changes);
      },
      describe: (input) => {
        const rows: [string, string][] = [["Goal ID", input.goalId]];
        if (input.name !== undefined) rows.push(["Name", input.name]);
        if (input.targetAmount !== undefined) rows.push(["Target", formatINR(input.targetAmount)]);
        if (input.currentAmount !== undefined) rows.push(["Saved", formatINR(input.currentAmount)]);
        if (input.deadline !== undefined) rows.push(["Deadline", input.deadline ?? "(none)"]);
        if (input.type !== undefined) rows.push(["Type", input.type]);
        return { type: "confirmation" as const, title: "Update goal", rows };
      },
      summarize: (output) => `Updated goal ${(output as { name: string }).name}`,
    }),
    defineTool({
      name: "goals.contribute",
      description:
        "Add money to a goal's saved amount (capped at the target). Requires confirmation. This is a bookkeeping update on the goal only — it does not move money between accounts.",
      access: "write",
      confirmation: "required",
      label: "Contributing to goal",
      invalidates: ["goals", "accounts", "analytics"],
      schema: contributeAmountSchema.extend({
        goalId: z.string().uuid("Invalid goal ID"),
      }),
      execute: async (input, ctx) =>
        goalsService.contribute(input.goalId, ctx.userId, input.amount),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Contribute to goal",
        rows: [
          ["Goal ID", input.goalId],
          ["Amount", formatINR(input.amount)],
        ],
      }),
      summarize: (output) => {
        const goal = output as { currentAmount: number };
        return `Contribution recorded — saved so far ${formatINR(goal.currentAmount)}`;
      },
    }),
    defineTool({
      name: "goals.delete",
      description:
        "Permanently delete one of the user's savings goals. Requires confirmation — this is destructive and cannot be undone.",
      access: "write",
      confirmation: "required",
      label: "Deleting savings goal",
      invalidates: ["goals", "accounts", "analytics"],
      schema: z.object({
        goalId: z.string().uuid("Invalid goal ID"),
      }),
      execute: async (input, ctx) => goalsService.remove(input.goalId, ctx.userId),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Delete goal",
        rows: [
          ["Goal ID", input.goalId],
          ["Warning", "Permanent delete — progress tracking for this goal is lost"],
        ],
      }),
      summarize: () => "Goal deleted",
    }),
  ];
}

import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { AnalyticsService } from "@/modules/analytics/analytics.service";
import { formatINR } from "@finai/finance-engine";
import { AgentToolName, ToolAccessLevel, ToolConfirmationType } from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS } from "@finai/ai-engine";

/**
 * Insight tools: computed guidance beyond raw KPIs. Kept separate from
 * analytics.tools.ts (same service, different purpose) — these aggregate
 * multiple signals into a single actionable number.
 */
export function createInsightsTools(analyticsService: AnalyticsService) {
  return [
    defineTool({
      name: AgentToolName.INSIGHTS_SAFE_TO_SPEND,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.INSIGHTS_SAFE_TO_SPEND],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.INSIGHTS_SAFE_TO_SPEND],
      schema: z.object({}),
      execute: async (_input, ctx) => analyticsService.getSafeToSpend(ctx.userId),
      serialize: (output) => {
        const result = output as {
          safeToSpend: number;
          liquidBalance: number;
          netMonthCashFlow: number;
          budgetCommitments: number;
          goalCommitments: number;
        };
        return { ...result };
      },
      summarize: (output) => {
        const { safeToSpend } = output as { safeToSpend: number };
        return `Safe to spend this month: ${formatINR(safeToSpend)}`;
      },
    }),
  ];
}

import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { AnalyticsService } from "@/modules/analytics/analytics.service";
import { formatINR, type Recommendation } from "@finai/finance-engine";
import { AgentToolName, ToolAccessLevel, ToolConfirmationType } from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS } from "@finai/ai-engine";

/**
 * Read tools over the existing AnalyticsService. These surface the same
 * deterministic numbers the dashboard shows (computed by @finai/finance-engine),
 * so the model grounds its advice in real KPIs instead of hallucinating them.
 */
export function createAnalyticsTools(analyticsService: AnalyticsService) {
  return [
    defineTool({
      name: AgentToolName.ANALYTICS_DASHBOARD,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ANALYTICS_DASHBOARD],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.ANALYTICS_DASHBOARD],
      schema: z.object({}),
      execute: async (_input, ctx) =>
        analyticsService.getDashboard(ctx.userId, ctx.workspaceId, ctx.memberUserIds),
      summarize: (output) => {
        const kpis = output as { netWorth: number; monthlyIncome: number; monthlyExpenses: number };
        return `Net worth ${formatINR(kpis.netWorth)}, income ${formatINR(kpis.monthlyIncome)}, expenses ${formatINR(kpis.monthlyExpenses)}`;
      },
    }),
    defineTool({
      name: AgentToolName.ANALYTICS_HEALTH_SCORE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ANALYTICS_HEALTH_SCORE],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.ANALYTICS_HEALTH_SCORE],
      schema: z.object({}),
      execute: async (_input, ctx) =>
        analyticsService.getHealthScore(ctx.userId, ctx.workspaceId, ctx.memberUserIds),
      summarize: (output) => {
        const health = output as { score: number; rating: string };
        return `Financial health score: ${health.score}/100 (${health.rating})`;
      },
    }),
    defineTool({
      name: AgentToolName.ANALYTICS_MONTHLY_CASH_FLOW,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ANALYTICS_MONTHLY_CASH_FLOW],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.ANALYTICS_MONTHLY_CASH_FLOW],
      schema: z.object({
        months: z.number().int().positive().max(24).default(6),
      }),
      execute: async (input, ctx) =>
        analyticsService.getMonthlyAnalytics(
          ctx.userId,
          input.months,
          ctx.workspaceId,
          ctx.memberUserIds,
        ),
      summarize: (output) => {
        const points = output as { month: string; income: number; expense: number }[];
        return `Cash flow for ${points.length} month(s)`;
      },
    }),
    defineTool({
      name: AgentToolName.ANALYTICS_RECOMMENDATIONS,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ANALYTICS_RECOMMENDATIONS],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.ANALYTICS_RECOMMENDATIONS],
      schema: z.object({}),
      execute: async (_input, ctx) =>
        analyticsService.getRecommendations(ctx.userId, ctx.workspaceId, ctx.memberUserIds),
      summarize: (output) => {
        const { recommendations } = output as { recommendations: Recommendation[] };
        return `Generated ${recommendations.length} recommendation(s)`;
      },
    }),
  ];
}

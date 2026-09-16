import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { AnalyticsService } from "@/modules/analytics/analytics.service";
import { formatINR, type Recommendation } from "@finai/finance-engine";

/**
 * Read tools over the existing AnalyticsService. These surface the same
 * deterministic numbers the dashboard shows (computed by @finai/finance-engine),
 * so the model grounds its advice in real KPIs instead of hallucinating them.
 */
export function createAnalyticsTools(analyticsService: AnalyticsService) {
  return [
    defineTool({
      name: "analytics.dashboard",
      description:
        "Get the user's current financial KPIs: net worth, monthly income/expenses, net cash flow, savings rate, and last-month comparison.",
      access: "read",
      confirmation: "none",
      label: "Analyzing your finances",
      schema: z.object({}),
      execute: async (_input, ctx) => analyticsService.getDashboard(ctx.userId),
      summarize: (output) => {
        const kpis = output as { netWorth: number; monthlyIncome: number; monthlyExpenses: number };
        return `Net worth ${formatINR(kpis.netWorth)}, income ${formatINR(kpis.monthlyIncome)}, expenses ${formatINR(kpis.monthlyExpenses)}`;
      },
    }),
    defineTool({
      name: "analytics.healthScore",
      description:
        "Get the user's financial health score (0-100) with component breakdowns: free cash, savings rate, emergency runway, debt pressure, budget control, and goal progress.",
      access: "read",
      confirmation: "none",
      label: "Calculating your financial health",
      schema: z.object({}),
      execute: async (_input, ctx) => analyticsService.getHealthScore(ctx.userId),
      summarize: (output) => {
        const health = output as { score: number; rating: string };
        return `Financial health score: ${health.score}/100 (${health.rating})`;
      },
    }),
    defineTool({
      name: "analytics.monthlyCashFlow",
      description: "Get monthly income/expense totals over the last N months for trend analysis.",
      access: "read",
      confirmation: "none",
      label: "Analyzing monthly cash flow",
      schema: z.object({
        months: z.number().int().positive().max(24).default(6),
      }),
      execute: async (input, ctx) => analyticsService.getMonthlyAnalytics(ctx.userId, input.months),
      summarize: (output) => {
        const points = output as { month: string; income: number; expense: number }[];
        return `Cash flow for ${points.length} month(s)`;
      },
    }),
    defineTool({
      name: "analytics.recommendations",
      description:
        "Get deterministic, prioritized financial recommendations (budget overruns, savings rate, emergency fund, goal deadlines) computed from the user's live data.",
      access: "read",
      confirmation: "none",
      label: "Generating recommendations",
      schema: z.object({}),
      execute: async (_input, ctx) => analyticsService.getRecommendations(ctx.userId),
      summarize: (output) => {
        const { recommendations } = output as { recommendations: Recommendation[] };
        return `Generated ${recommendations.length} recommendation(s)`;
      },
    }),
  ];
}

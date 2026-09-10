import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { AnalyticsService } from "@/modules/analytics/analytics.service";
import { formatINR } from "@finai/finance-engine";

/**
 * Insight tools: computed guidance beyond raw KPIs. Kept separate from
 * analytics.tools.ts (same service, different purpose) — these aggregate
 * multiple signals into a single actionable number.
 */
export function createInsightsTools(analyticsService: AnalyticsService) {
  return [
    defineTool({
      name: "insights.safeToSpend",
      description:
        "Estimate how much the user can safely spend for the rest of the current month without jeopardizing budgets or goals. Based on liquid balance + month-to-date net cash flow − remaining budget commitments − goal installments.",
      access: "read",
      confirmation: "none",
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

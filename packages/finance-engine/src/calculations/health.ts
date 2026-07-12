/**
 * Financial health score calculations — pure functions.
 */

import type { HealthMetric } from "@finai/shared-types";

interface HealthInput {
  savingsRate: number;
  budgetAdherence: number;
  emergencyFundMonths: number;
  investmentDiversification: number;
  debtToIncomeRatio: number;
}

interface ComponentScore {
  label: string;
  score: number;
  note: string;
}

/**
 * Calculate individual component scores from financial data.
 */
export function calculateComponentScores(input: HealthInput): ComponentScore[] {
  return [
    {
      label: "Spending Control",
      score: clampScore(input.budgetAdherence > 0.9 ? 90 : input.budgetAdherence > 0.75 ? 75 : 55),
      note:
        input.budgetAdherence > 0.9
          ? "Below monthly cap"
          : input.budgetAdherence > 0.75
            ? "Slightly above target"
            : "Spending needs attention",
    },
    {
      label: "Savings Rate",
      score: clampScore(Math.min(100, input.savingsRate * 2)),
      note: `${Math.round(input.savingsRate)}% of income saved`,
    },
    {
      label: "Investments",
      score: clampScore(input.investmentDiversification),
      note: `Diversified across assets`,
    },
    {
      label: "Emergency Fund",
      score: clampScore(
        input.emergencyFundMonths >= 6 ? 85 : input.emergencyFundMonths >= 3 ? 65 : 35,
      ),
      note: `${input.emergencyFundMonths.toFixed(1)} months covered`,
    },
    {
      label: "Budget Discipline",
      score: clampScore(input.budgetAdherence >= 1 ? 60 : input.budgetAdherence >= 0.85 ? 75 : 90),
      note:
        input.budgetAdherence >= 1 ? "Some categories over budget" : "All categories within limit",
    },
  ];
}

/**
 * Calculate overall financial health score (0–100).
 */
export function calculateFinancialHealthScore(input: HealthInput): {
  score: number;
  metrics: HealthMetric[];
  rating: string;
} {
  const components = calculateComponentScores(input);
  const score = Math.round(components.reduce((sum, c) => sum + c.score, 0) / components.length);

  const rating =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Attention";

  return { score, metrics: components, rating };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

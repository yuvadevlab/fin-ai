import {
  HEALTH_DATA_QUALITY,
  HEALTH_METRIC_KEYS,
  HEALTH_METRIC_LABELS,
  HEALTH_METRIC_STATUSES,
  HEALTH_METRIC_WEIGHTS,
  HEALTH_RATINGS,
  HEALTH_TARGETS,
  type HealthMetric,
  type HealthMetricKey,
  type HealthMetricUnit,
} from "@finai/shared-types";

/**
 * Financial health score calculations — pure functions.
 */

export interface HealthInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  budgetAdherence: number;
  emergencyFundMonths: number;
  investmentDiversification: number;
  debtToIncomeRatio: number;
  goalProgress: number;
}

export function calculateComponentScores(input: HealthInput): ComponentScore[] {
  return [
    metric(
      HEALTH_METRIC_KEYS.FREE_CASH,
      HEALTH_METRIC_LABELS[HEALTH_METRIC_KEYS.FREE_CASH],
      input.monthlyIncome > 0 ? input.monthlyIncome - input.monthlyExpenses : 0,
      input.monthlyIncome * HEALTH_TARGETS.FREE_CASH_RATE,
      "INR",
      input.monthlyIncome > 0
        ? scoreRatio(
            (input.monthlyIncome - input.monthlyExpenses) / input.monthlyIncome,
            HEALTH_TARGETS.FREE_CASH_RATE,
          )
        : 0,
      input.monthlyIncome > 0
        ? "Money left after this month's expenses."
        : "Income is not tracked yet.",
      input.monthlyIncome > 0
        ? "Keep a positive monthly surplus."
        : "Add income transactions to measure cash flow.",
      input.monthlyIncome > 0,
    ),
    metric(
      HEALTH_METRIC_KEYS.SAVINGS_RATE,
      HEALTH_METRIC_LABELS[HEALTH_METRIC_KEYS.SAVINGS_RATE],
      input.savingsRate,
      HEALTH_TARGETS.SAVINGS_RATE,
      "%",
      scoreRatio(input.savingsRate / 100, 0.2),
      `${Math.round(input.savingsRate)}% of income is being retained.`,
      "Automate savings until you reach 20% of income.",
      input.monthlyIncome > 0,
    ),
    metric(
      HEALTH_METRIC_KEYS.EMERGENCY_RUNWAY,
      HEALTH_METRIC_LABELS[HEALTH_METRIC_KEYS.EMERGENCY_RUNWAY],
      input.emergencyFundMonths,
      HEALTH_TARGETS.EMERGENCY_RUNWAY_MONTHS,
      "months",
      scoreRatio(input.emergencyFundMonths, HEALTH_TARGETS.EMERGENCY_RUNWAY_MONTHS),
      input.emergencyFundMonths > 0
        ? `Your emergency savings cover about ${input.emergencyFundMonths.toFixed(1)} months.`
        : "No emergency savings are tracked.",
      "Build one month of essential expenses first, then work toward six.",
      true,
    ),
    metric(
      HEALTH_METRIC_KEYS.DEBT_PRESSURE,
      HEALTH_METRIC_LABELS[HEALTH_METRIC_KEYS.DEBT_PRESSURE],
      input.debtToIncomeRatio * 100,
      HEALTH_TARGETS.DEBT_PRESSURE_RATE,
      "% of income",
      debtScore(input.debtToIncomeRatio),
      `Debt uses about ${Math.round(input.debtToIncomeRatio * 100)}% of monthly income.`,
      "Prioritize high-interest debt before increasing discretionary investing.",
      input.monthlyIncome > 0,
    ),
    metric(
      HEALTH_METRIC_KEYS.BUDGET_CONTROL,
      HEALTH_METRIC_LABELS[HEALTH_METRIC_KEYS.BUDGET_CONTROL],
      input.budgetAdherence < 0 ? 0 : input.budgetAdherence * 100,
      HEALTH_TARGETS.BUDGET_CONTROL_RATE,
      "% within limit",
      input.budgetAdherence < 0 ? 0 : input.budgetAdherence * 100,
      input.budgetAdherence < 0
        ? "No budgets are configured yet."
        : `${Math.round(input.budgetAdherence * 100)}% of budgets are within limit.`,
      "Create budgets for your largest spending categories.",
      input.budgetAdherence >= 0,
    ),
    metric(
      HEALTH_METRIC_KEYS.GOAL_PROGRESS,
      HEALTH_METRIC_LABELS[HEALTH_METRIC_KEYS.GOAL_PROGRESS],
      input.goalProgress < 0 ? 0 : input.goalProgress,
      HEALTH_TARGETS.GOAL_PROGRESS_RATE,
      "% funded",
      input.goalProgress < 0 ? 0 : input.goalProgress,
      input.goalProgress < 0
        ? "No savings goals are configured yet."
        : `Your goals are ${Math.round(input.goalProgress)}% funded on average.`,
      "Set a monthly contribution for your most important goal.",
      input.goalProgress >= 0,
    ),
  ];
}

export function calculateFinancialHealthScore(input: HealthInput): {
  score: number;
  metrics: ComponentScore[];
  rating: string;
  summary: string;
  topStrength: string;
  topRisk: string;
  nextBestAction: string;
} {
  const components = calculateComponentScores(input);
  const available = components.filter((component) => component.dataQuality === "complete");
  const weightTotal = available.reduce(
    (sum, component) => sum + HEALTH_METRIC_WEIGHTS[component.key],
    0,
  );
  const weightedScore =
    weightTotal === 0
      ? 0
      : available.reduce(
          (sum, component) => sum + component.score * HEALTH_METRIC_WEIGHTS[component.key],
          0,
        ) / weightTotal;
  const emergency = components.find(
    (component) => component.key === HEALTH_METRIC_KEYS.EMERGENCY_RUNWAY,
  );
  const debt = components.find((component) => component.key === HEALTH_METRIC_KEYS.DEBT_PRESSURE);
  const freeCash = components.find((component) => component.key === HEALTH_METRIC_KEYS.FREE_CASH);
  const riskCap =
    (emergency?.current ?? 0) < 1
      ? 59
      : (debt?.current ?? 0) > 50
        ? 59
        : (freeCash?.current ?? 0) < 0
          ? 49
          : 100;
  const score = Math.round(Math.min(weightedScore, riskCap));

  const rating =
    score >= 80
      ? HEALTH_RATINGS.STRONG_FOUNDATION
      : score >= 60
        ? HEALTH_RATINGS.BUILDING_STABILITY
        : score >= 40
          ? HEALTH_RATINGS.NEEDS_A_PLAN
          : HEALTH_RATINGS.NEEDS_ATTENTION;
  const strengths = available
    .filter((component) => component.score >= 75)
    .sort((a, b) => b.score - a.score);
  const risks = available
    .filter((component) => component.score < 60)
    .sort((a, b) => a.score - b.score);
  const topStrength =
    strengths[0]?.note ?? "Start tracking more data to identify your strongest habit.";
  const topRisk = risks[0]?.note ?? "Your tracked financial foundations are currently balanced.";
  const nextBestAction =
    risks[0]?.nextAction ?? "Keep your current habits consistent and review this monthly.";
  const summary =
    risks.length > 0
      ? `${topStrength} Your main constraint is ${risks[0].label.toLowerCase()}.`
      : "Your tracked financial habits are moving in a healthy direction.";

  return { score, metrics: components, rating, summary, topStrength, topRisk, nextBestAction };
}

export type ComponentScore = HealthMetric;

function metric(
  key: HealthMetricKey,
  label: string,
  current: number,
  target: number,
  unit: HealthMetricUnit,
  score: number,
  note: string,
  nextAction: string,
  available: boolean,
): ComponentScore {
  const normalizedScore = clampScore(score);
  return {
    key,
    label,
    score: normalizedScore,
    note,
    current: round(current),
    target,
    unit,
    status: !available
      ? HEALTH_METRIC_STATUSES.UNAVAILABLE
      : normalizedScore >= 80
        ? HEALTH_METRIC_STATUSES.STRONG
        : normalizedScore >= 60
          ? HEALTH_METRIC_STATUSES.ON_TRACK
          : normalizedScore >= 40
            ? HEALTH_METRIC_STATUSES.NEEDS_ATTENTION
            : HEALTH_METRIC_STATUSES.CRITICAL,
    nextAction,
    dataQuality: available ? HEALTH_DATA_QUALITY.COMPLETE : HEALTH_DATA_QUALITY.MISSING,
  };
}

function scoreRatio(value: number, target: number): number {
  return clampScore((value / target) * 100);
}

function debtScore(ratio: number): number {
  if (ratio <= 0.1) return 100;
  if (ratio <= 0.3) return 80 - ((ratio - 0.1) / 0.2) * 20;
  if (ratio <= 0.5) return 60 - ((ratio - 0.3) / 0.2) * 50;
  return Math.max(0, 10 - (ratio - 0.5) * 20);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

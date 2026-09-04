import type { HealthMetricKey } from "./health.types";

export const HEALTH_RATINGS = {
  STRONG_FOUNDATION: "Strong foundation",
  BUILDING_STABILITY: "Building stability",
  NEEDS_A_PLAN: "Needs a plan",
  NEEDS_ATTENTION: "Needs attention",
} as const;

export const HEALTH_METRIC_LABELS: Record<HealthMetricKey, string> = {
  freeCash: "Monthly free cash",
  savingsRate: "Savings rate",
  emergencyRunway: "Emergency runway",
  debtPressure: "Debt pressure",
  budgetControl: "Budget control",
  goalProgress: "Goal progress",
};

export const HEALTH_METRIC_WEIGHTS: Record<HealthMetricKey, number> = {
  freeCash: 0.2,
  savingsRate: 0.2,
  emergencyRunway: 0.25,
  debtPressure: 0.2,
  budgetControl: 0.1,
  goalProgress: 0.05,
};

export const HEALTH_TARGETS = {
  FREE_CASH_RATE: 0.2,
  SAVINGS_RATE: 20,
  EMERGENCY_RUNWAY_MONTHS: 6,
  DEBT_PRESSURE_RATE: 30,
  BUDGET_CONTROL_RATE: 90,
  GOAL_PROGRESS_RATE: 70,
} as const;

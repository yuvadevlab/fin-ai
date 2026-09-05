export const HEALTH_METRIC_KEYS = {
  FREE_CASH: "freeCash",
  SAVINGS_RATE: "savingsRate",
  EMERGENCY_RUNWAY: "emergencyRunway",
  DEBT_PRESSURE: "debtPressure",
  BUDGET_CONTROL: "budgetControl",
  GOAL_PROGRESS: "goalProgress",
} as const;

export type HealthMetricKey = (typeof HEALTH_METRIC_KEYS)[keyof typeof HEALTH_METRIC_KEYS];

export const HEALTH_METRIC_STATUSES = {
  STRONG: "strong",
  ON_TRACK: "on_track",
  NEEDS_ATTENTION: "needs_attention",
  CRITICAL: "critical",
  UNAVAILABLE: "unavailable",
} as const;

export type HealthMetricStatus =
  (typeof HEALTH_METRIC_STATUSES)[keyof typeof HEALTH_METRIC_STATUSES];

export const HEALTH_DATA_QUALITY = {
  COMPLETE: "complete",
  MISSING: "missing",
} as const;

export type HealthDataQuality = (typeof HEALTH_DATA_QUALITY)[keyof typeof HEALTH_DATA_QUALITY];

export type HealthMetricUnit =
  "INR" | "%" | "months" | "% of income" | "% within limit" | "% funded";

export interface HealthMetric {
  key: HealthMetricKey;
  label: string;
  score: number;
  note: string;
  current: number;
  target: number;
  unit: HealthMetricUnit;
  status: HealthMetricStatus;
  nextAction: string;
  dataQuality: HealthDataQuality;
}

export interface HealthScore {
  score: number;
  metrics: HealthMetric[];
  rating: string;
  summary: string;
  topStrength: string;
  topRisk: string;
  nextBestAction: string;
}

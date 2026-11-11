/**
 * @file packages/finance-engine/src/calculations/health-helpers.ts
 * @description Helper functions for financial health scoring.
 * @module @finai/finance-engine/calculations
 */

import {
  HEALTH_DATA_QUALITY,
  HEALTH_METRIC_STATUSES,
  type HealthMetric,
  type HealthMetricKey,
  type HealthMetricUnit,
} from "@finai/shared-types";

export type ComponentScore = HealthMetric;

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function scoreRatio(value: number, target: number): number {
  return clampScore((value / target) * 100);
}

export function debtScore(ratio: number): number {
  if (ratio <= 0.1) return 100;
  if (ratio <= 0.3) return 80 - ((ratio - 0.1) / 0.2) * 20;
  if (ratio <= 0.5) return 60 - ((ratio - 0.3) / 0.2) * 50;
  return Math.max(0, 10 - (ratio - 0.5) * 20);
}

export function metric(
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

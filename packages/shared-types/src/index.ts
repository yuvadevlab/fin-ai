/**
 * @module shared-types
 *
 * **Purpose:** Single source of truth for all shared TypeScript types,
 * enums, and DTOs across the FinAI monorepo.
 *
 * Both `apps/web` and `apps/api` import from this package. Per AGENTS.md,
 * never duplicate a type here into an app or another package.
 */

export * from "./enums";
export * from "./models";
export * from "./api.types";

export { HEALTH_DATA_QUALITY, HEALTH_METRIC_KEYS, HEALTH_METRIC_STATUSES } from "./health.types";
export type {
  HealthDataQuality,
  HealthMetric,
  HealthMetricKey,
  HealthMetricStatus,
  HealthMetricUnit,
  HealthScore,
} from "./health.types";
export {
  HEALTH_METRIC_LABELS,
  HEALTH_METRIC_WEIGHTS,
  HEALTH_RATINGS,
  HEALTH_TARGETS,
} from "./health.constants";

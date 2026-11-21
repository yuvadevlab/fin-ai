/**
 * @file apps/web/src/features/marketing/data/features-registry.ts
 * @description Centralized data registry aggregating all FinAI product features.
 * Mirrors devlab-shared/ui-docs catalog architecture to prevent page duplication.
 * @module @fin-ai/web/features/marketing/data/features-registry
 */

import { CORE_FEATURES } from "./features-core.data";
import { WEALTH_FEATURES } from "./features-wealth.data";
import type { FeatureDoc } from "./features-registry.types";

export const FEATURES_REGISTRY: readonly FeatureDoc[] = [
  ...CORE_FEATURES,
  ...WEALTH_FEATURES,
] as const;

export * from "./features-registry.types";
export * from "./features-core.data";
export * from "./features-wealth.data";

/**
 * @file apps/web/src/features/marketing/data/features-registry.types.ts
 * @description Strongly-typed schemas for FinAI marketing feature registry.
 * Adheres to Rule 7 (Enums/as-const over raw string unions) and Rule 4 (< 250 lines).
 * @module @fin-ai/web/features/marketing/data/features-registry.types
 */

export interface FeatureCapability {
  readonly title: string;
  readonly description: string;
  readonly benefits: readonly string[];
}

export interface FeatureRelatedLink {
  readonly title: string;
  readonly href: string;
  readonly description: string;
}

export interface FeatureDoc {
  readonly slug: string;
  readonly badge: string;
  readonly title: string;
  readonly description: string;
  readonly capabilities: readonly FeatureCapability[];
  readonly relatedLinks: readonly FeatureRelatedLink[];
  readonly seoKey:
    | "EXPENSE_TRACKING"
    | "BUDGET_PLANNING"
    | "AI_FINANCIAL_ADVISOR"
    | "WEALTH_MANAGEMENT"
    | "FINANCIAL_GOALS";
}

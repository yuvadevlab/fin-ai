/**
 * @file apps/web/src/lib/ui-copy/index.ts
 * @description Centralized, modular UI copy dictionary catalog.
 * Eliminates raw string literals, hardcoded placeholders, and ad-hoc a11y texts in JSX.
 * @module @finai/web/lib/ui-copy
 */

import { COMMON_COPY } from "./common";
import { ADVISOR_COPY } from "./advisor";
import { ACCOUNTS_COPY } from "./accounts";
import { BUDGETS_COPY } from "./budgets";
import { CATEGORIES_COPY } from "./categories";
import { DASHBOARD_COPY } from "./dashboard";
import { HEALTH_COPY } from "./health";
import { GOALS_COPY } from "./goals";
import { NOTIFICATIONS_COPY } from "./notifications";
import { INVESTMENTS_COPY } from "./investments";
import { REPORTS_COPY } from "./reports";
import { SEARCH_COPY } from "./search";
import { SETTINGS_COPY } from "./settings";
import { TRANSACTIONS_COPY } from "./transactions";

export * from "./common";
export * from "./advisor";
export * from "./accounts";
export * from "./budgets";
export * from "./categories";
export * from "./dashboard";
export * from "./health";
export * from "./goals";
export * from "./notifications";
export * from "./investments";
export * from "./reports";
export * from "./search";
export * from "./settings";
export * from "./transactions";

/**
 * Universal, type-safe dictionary of user-facing UI text strings,
 * placeholders, accessibility labels, and action copy.
 */
export const UI_COPY = {
  COMMON: COMMON_COPY,
  ADVISOR: ADVISOR_COPY,
  ACCOUNTS: ACCOUNTS_COPY,
  BUDGETS: BUDGETS_COPY,
  CATEGORIES: CATEGORIES_COPY,
  DASHBOARD: DASHBOARD_COPY,
  HEALTH: HEALTH_COPY,
  GOALS: GOALS_COPY,
  NOTIFICATIONS: NOTIFICATIONS_COPY,
  INVESTMENTS: INVESTMENTS_COPY,
  REPORTS: REPORTS_COPY,
  SEARCH: SEARCH_COPY,
  SETTINGS: SETTINGS_COPY,
  TRANSACTIONS: TRANSACTIONS_COPY,
} as const;

export type UiCopyCatalog = typeof UI_COPY;

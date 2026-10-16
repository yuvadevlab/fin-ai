/**
 * @file apps/web/src/lib/app-constants.ts
 * @description Centralized application constants, identifiers, and operational defaults.
 * @module @finai/web/lib/app-constants
 */

/** Application platform identifier consumed by DevLab auth and telemetry */
export const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "finai";

/** Fallback base API URL when NEXT_PUBLIC_API_URL environment variable is unset */
export const DEFAULT_API_BASE_URL = "http://localhost:4000/api/v1";

/** Fallback DevLab Gateway URL when NEXT_PUBLIC_GATEWAY_URL is unset */
export const DEFAULT_GATEWAY_URL = "http://localhost:3015";

/** Canonical DevLab Gateway URL for unified single sign-on */
export const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || DEFAULT_GATEWAY_URL;

/** Page-level access and navigation toggles */
export const PAGE_FLAGS = {
  SETTINGS: process.env.NEXT_PUBLIC_PAGE_SETTINGS !== "false",
  AI_ADVISOR: process.env.NEXT_PUBLIC_PAGE_AI_ADVISOR !== "false",
};

/** Global application feature toggles */
export const FEATURE_FLAGS = {
  ACCOUNTS: process.env.NEXT_PUBLIC_FEATURE_ACCOUNTS !== "false",
  AI_ADVISOR: process.env.NEXT_PUBLIC_FEATURE_AI_ADVISOR !== "false",
  AI_INSIGHT: process.env.NEXT_PUBLIC_FEATURE_AI_INSIGHT === "true",
  BUDGETS: process.env.NEXT_PUBLIC_FEATURE_BUDGETS !== "false",
  FAMILY: process.env.NEXT_PUBLIC_FEATURE_FAMILY === "true",
  GOALS: process.env.NEXT_PUBLIC_FEATURE_GOALS !== "false",
  HEALTH: process.env.NEXT_PUBLIC_FEATURE_HEALTH !== "false",
  INVESTMENTS: process.env.NEXT_PUBLIC_FEATURE_INVESTMENTS !== "false",
  NOTIFICATIONS: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS === "true",
  REPORTS: process.env.NEXT_PUBLIC_FEATURE_REPORTS !== "false",
  SEARCH: process.env.NEXT_PUBLIC_FEATURE_SEARCH === "true",
  SETTINGS: process.env.NEXT_PUBLIC_FEATURE_SETTINGS !== "false",
  TRANSACTIONS: process.env.NEXT_PUBLIC_FEATURE_TRANSACTIONS !== "false",
};

/** Granular section toggles for the user Settings view (/settings) */
export const SETTING_FLAGS = {
  PROFILE: process.env.NEXT_PUBLIC_SETTING_PROFILE !== "false",
  WORKSPACE: process.env.NEXT_PUBLIC_SETTING_WORKSPACE === "true",
  MEMBERS: process.env.NEXT_PUBLIC_SETTING_MEMBERS === "true",
  NOTIFICATIONS: process.env.NEXT_PUBLIC_SETTING_NOTIFICATIONS !== "false",
  CATEGORIES: process.env.NEXT_PUBLIC_SETTING_CATEGORIES !== "false",
  ACCOUNTS: process.env.NEXT_PUBLIC_SETTING_ACCOUNTS !== "false",
  SECURITY: process.env.NEXT_PUBLIC_SETTING_SECURITY !== "false",
  APPEARANCE: process.env.NEXT_PUBLIC_SETTING_APPEARANCE !== "false",
  MIGRATION: process.env.NEXT_PUBLIC_SETTING_MIGRATION !== "false",
};

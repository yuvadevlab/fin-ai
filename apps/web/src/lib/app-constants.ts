/**
 * @file apps/web/src/lib/app-constants.ts
 * @description Centralized application constants, identifiers, and operational defaults.
 * @module @finai/web/lib/app-constants
 */

import { DEVLAB_CONFIG } from "@finai/shared-types";

/** Application platform identifier consumed by DevLab auth and telemetry */
export const APP_ID = process.env.NEXT_PUBLIC_APP_ID || DEVLAB_CONFIG.APP_ID;

/** Fallback base API URL when NEXT_PUBLIC_API_URL environment variable is unset */
export const DEFAULT_API_BASE_URL = "http://localhost:4000/api/v1";

/** DevLab Portal Web UI URL (for login redirects) */
export const DEVLAB_PORTAL_WEB_URL =
  process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL || "http://localhost:3005";

/** DevLab Portal API URL (for token verification / OIDC) */
export const DEVLAB_PORTAL_API_URL =
  process.env.NEXT_PUBLIC_DEVLAB_PORTAL_API_URL || "http://localhost:3015";

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
  SHARED_WORKSPACE: process.env.NEXT_PUBLIC_FEATURE_SHARED_WORKSPACE !== "false",
  GOALS: process.env.NEXT_PUBLIC_FEATURE_GOALS !== "false",
  HEALTH: process.env.NEXT_PUBLIC_FEATURE_HEALTH !== "false",
  INVESTMENTS: process.env.NEXT_PUBLIC_FEATURE_INVESTMENTS !== "false",
  NOTIFICATIONS: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS !== "false",
  REPORTS: process.env.NEXT_PUBLIC_FEATURE_REPORTS !== "false",
  SEARCH: process.env.NEXT_PUBLIC_FEATURE_SEARCH === "true",
  SETTINGS: process.env.NEXT_PUBLIC_FEATURE_SETTINGS !== "false",
  TRANSACTIONS: process.env.NEXT_PUBLIC_FEATURE_TRANSACTIONS !== "false",
};

/** Granular section toggles for the user Settings view (/settings) */
export const SETTING_FLAGS = {
  PROFILE: process.env.NEXT_PUBLIC_SETTING_PROFILE !== "false",
  WORKSPACE: process.env.NEXT_PUBLIC_SETTING_WORKSPACE !== "false",
  MEMBERS: process.env.NEXT_PUBLIC_SETTING_MEMBERS !== "false",
  NOTIFICATIONS: process.env.NEXT_PUBLIC_SETTING_NOTIFICATIONS !== "false",
  CATEGORIES: process.env.NEXT_PUBLIC_SETTING_CATEGORIES !== "false",
  ACCOUNTS: process.env.NEXT_PUBLIC_SETTING_ACCOUNTS !== "false",
  SECURITY: process.env.NEXT_PUBLIC_SETTING_SECURITY !== "false",
  APPEARANCE: process.env.NEXT_PUBLIC_SETTING_APPEARANCE !== "false",
  MIGRATION: process.env.NEXT_PUBLIC_SETTING_MIGRATION !== "false",
};

/**
 * @file apps/web/src/lib/routes.ts
 * @description Centralized application and API route path catalog.
 * Eliminates hardcoded URL string literals and deep path strings across pages and hooks.
 * @module @finai/web/lib/routes
 */

import { API_ENDPOINTS, DEVLAB_CONFIG } from "@finai/shared-types";
import { DEVLAB_PORTAL_WEB_URL, APP_ID } from "./app-constants";

/** Client-side Next.js route paths */
export const APP_ROUTES = {
  HOME: "/",
  DASHBOARD: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ADVISOR: "/ai-advisor",
  ADVISOR_THREAD: (id: string) => `/ai-advisor/${id}`,
  TRANSACTIONS: "/transactions",
  BUDGETS: "/budgets",
  GOALS: "/goals",
  INVESTMENTS: "/investments",
  ACCOUNTS: "/accounts",
  CATEGORIES: "/categories",
  REPORTS: "/reports",
  HEALTH: "/health",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
} as const;

/** Options for initiating authentication against DevLab Portal SSO */
export interface DevLabPortalLoginOptions {
  redirectUrl?: string;
  error?: string;
  prompt?: "login" | "select_account" | "consent";
}

/** DevLab Central Portal SSO route builders and canonical destinations */
export const DEVLAB_PORTAL_ROUTES = {
  LOGIN: (redirectUrlOrOptions?: string | DevLabPortalLoginOptions) => {
    let redirectUrl: string | undefined;
    let error: string | undefined;
    let prompt: string | undefined;

    if (typeof redirectUrlOrOptions === "object" && redirectUrlOrOptions !== null) {
      redirectUrl = redirectUrlOrOptions.redirectUrl;
      error = redirectUrlOrOptions.error;
      prompt = redirectUrlOrOptions.prompt;
    } else {
      redirectUrl = redirectUrlOrOptions;
    }

    const base = `${DEVLAB_PORTAL_WEB_URL}${DEVLAB_CONFIG.PATHS.LOGIN}?app=${encodeURIComponent(APP_ID)}`;
    try {
      const url = new URL(base);
      if (redirectUrl) {
        url.searchParams.set("redirect", redirectUrl);
      }
      if (error) {
        url.searchParams.set("error", error);
      }
      if (prompt) {
        url.searchParams.set("prompt", prompt);
      }
      return url.toString();
    } catch {
      let result = base;
      if (redirectUrl) result += `&redirect=${encodeURIComponent(redirectUrl)}`;
      if (error) result += `&error=${encodeURIComponent(error)}`;
      if (prompt) result += `&prompt=${encodeURIComponent(prompt)}`;
      return result;
    }
  },
  REGISTER: () =>
    `${DEVLAB_PORTAL_WEB_URL}${DEVLAB_CONFIG.PATHS.REGISTER}?app=${encodeURIComponent(APP_ID)}`,
  FORGOT_PASSWORD: () =>
    `${DEVLAB_PORTAL_WEB_URL}${DEVLAB_CONFIG.PATHS.FORGOT_PASSWORD}?app=${encodeURIComponent(APP_ID)}`,
  RESET_PASSWORD: () =>
    `${DEVLAB_PORTAL_WEB_URL}${DEVLAB_CONFIG.PATHS.RESET_PASSWORD}?app=${encodeURIComponent(APP_ID)}`,
} as const;

/** Backend API route paths consumed by apiClient and fetch */
export const API_ROUTES = {
  AUTH_LOGIN: API_ENDPOINTS.AUTH.LOGIN,
  AUTH_REGISTER: API_ENDPOINTS.AUTH.REGISTER,
  AUTH_FORGOT_PASSWORD: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  AUTH_RESET_PASSWORD: API_ENDPOINTS.AUTH.RESET_PASSWORD,
  MENU_ITEMS: API_ENDPOINTS.MENU_ITEMS.BASE,
  AGENT_CHAT: API_ENDPOINTS.AGENT.CHAT,
  AI_CONVERSATIONS: API_ENDPOINTS.AI.CONVERSATIONS,
  AI_CONVERSATION_BY_ID: API_ENDPOINTS.AI.CONVERSATION,
  AGENT_ACTIONS_PROPOSED: API_ENDPOINTS.AGENT.PROPOSED_ACTIONS,
  AGENT_ACTIONS_CONFIRM: API_ENDPOINTS.AGENT.CONFIRM_ACTION,
  AGENT_ACTIONS_REJECT: API_ENDPOINTS.AGENT.REJECT_ACTION,
  OPTIONS: API_ENDPOINTS.OPTIONS.BASE,
  OPTIONS_CATEGORY: API_ENDPOINTS.OPTIONS.CATEGORY,
} as const;

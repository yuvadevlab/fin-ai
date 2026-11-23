/**
 * @file apps/web/src/lib/routes.ts
 * @description Centralized application and API route path catalog.
 * Eliminates hardcoded URL string literals and deep path strings across pages and hooks.
 * @module @fin-ai/web/lib/routes
 */

import {
  API_ENDPOINTS,
  DEVLAB_CONFIG,
  AuthQueryParamKey,
  type AuthPrompt,
} from "@fin-ai/shared-types";
import { DEVLAB_PORTAL_WEB_URL, APP_ID } from "./app-constants";

/** Client-side Next.js route paths */
export const APP_ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  FEATURES: "/features",
  EXPENSE_TRACKING: "/expense-tracking",
  BUDGET_PLANNING: "/budget-planning",
  AI_FINANCIAL_ADVISOR: "/ai-financial-advisor",
  WEALTH_MANAGEMENT: "/wealth-management",
  FINANCIAL_GOALS: "/financial-goals",
  ABOUT: "/about",
  BLOG: "/blog",
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  PRIVACY_POLICY: "/privacy-policy",
  TERMS_OF_SERVICE: "/terms-of-service",
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
  prompt?: AuthPrompt;
}

/**
 * Resolves the fully-qualified base URL of the FinAI web application.
 * In browser environments, dynamically derives the current window origin so
 * authentication handoffs stay pinned to the exact host and port (e.g. localhost:3001).
 * On the server, falls back to NEXT_PUBLIC_APP_URL, defaulting to localhost:3001 in development.
 */
export function getAppBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://fin-ai-yuvadevlab.vercel.app";
}

/**
 * Constructs an absolute callback URL for DevLab Portal SSO handoffs.
 *
 * @param path - Target route within the FinAI application (defaults to /dashboard)
 * @returns Fully-qualified destination URL
 */
export function getAuthRedirectUrl(path: string = APP_ROUTES.DASHBOARD): string {
  const baseUrl = getAppBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/** DevLab Central Portal SSO route builders and canonical destinations */
export const DEVLAB_PORTAL_ROUTES = {
  LOGIN: (redirectUrlOrOptions?: string | DevLabPortalLoginOptions) => {
    let redirectUrl: string | undefined;
    let error: string | undefined;
    let prompt: AuthPrompt | undefined;

    if (typeof redirectUrlOrOptions === "object" && redirectUrlOrOptions !== null) {
      redirectUrl = redirectUrlOrOptions.redirectUrl;
      error = redirectUrlOrOptions.error;
      prompt = redirectUrlOrOptions.prompt;
    } else {
      redirectUrl = redirectUrlOrOptions;
    }

    const destination = redirectUrl || getAuthRedirectUrl(APP_ROUTES.DASHBOARD);
    const url = new URL(`${DEVLAB_PORTAL_WEB_URL}${DEVLAB_CONFIG.PATHS.LOGIN}`);
    url.searchParams.set(AuthQueryParamKey.APP, APP_ID);
    url.searchParams.set(AuthQueryParamKey.REDIRECT, destination);
    if (error) {
      url.searchParams.set(AuthQueryParamKey.ERROR, error);
    }
    if (prompt) {
      url.searchParams.set(AuthQueryParamKey.PROMPT, prompt);
    }
    return url.toString();
  },
  REGISTER: (redirectUrl?: string) => {
    const destination = redirectUrl || getAuthRedirectUrl(APP_ROUTES.DASHBOARD);
    const url = new URL(`${DEVLAB_PORTAL_WEB_URL}${DEVLAB_CONFIG.PATHS.REGISTER}`);
    url.searchParams.set(AuthQueryParamKey.APP, APP_ID);
    url.searchParams.set(AuthQueryParamKey.REDIRECT, destination);
    return url.toString();
  },
  FORGOT_PASSWORD: () => {
    const url = new URL(`${DEVLAB_PORTAL_WEB_URL}${DEVLAB_CONFIG.PATHS.FORGOT_PASSWORD}`);
    url.searchParams.set(AuthQueryParamKey.APP, APP_ID);
    return url.toString();
  },
  RESET_PASSWORD: () => {
    const url = new URL(`${DEVLAB_PORTAL_WEB_URL}${DEVLAB_CONFIG.PATHS.RESET_PASSWORD}`);
    url.searchParams.set(AuthQueryParamKey.APP, APP_ID);
    return url.toString();
  },
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

/**
 * @file apps/web/src/lib/routes.ts
 * @description Centralized application and API route path catalog.
 * Eliminates hardcoded URL string literals and deep path strings across pages and hooks.
 * @module @finai/web/lib/routes
 */

/** Client-side Next.js route paths */
export const APP_ROUTES = {
  ADVISOR: "/ai-advisor",
  ADVISOR_THREAD: (id: string) => `/ai-advisor/${id}`,
  DASHBOARD: "/",
  TRANSACTIONS: "/transactions",
  BUDGETS: "/budgets",
  GOALS: "/goals",
  INVESTMENTS: "/investments",
  ACCOUNTS: "/accounts",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
} as const;

/** Backend API route paths consumed by apiClient and fetch */
export const API_ROUTES = {
  AGENT_CHAT: "agent/chat",
  AI_CONVERSATIONS: "ai/conversations",
  AI_CONVERSATION_BY_ID: (id: string) => `ai/conversations/${id}`,
  AGENT_ACTIONS_PROPOSED: "agent/actions/proposed",
  AGENT_ACTIONS_CONFIRM: (id: string) => `agent/actions/${id}/confirm`,
  AGENT_ACTIONS_REJECT: (id: string) => `agent/actions/${id}/reject`,
  OPTIONS: "options",
  OPTIONS_CATEGORY: (cat: string) => `options/${cat}`,
} as const;

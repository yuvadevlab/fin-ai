/**
 * @file packages/shared-types/src/query-keys.ts
 * @description Centralized TanStack Query cache keys across web client applications.
 * Eliminates ad-hoc string array keys and provides unified invalidate/prefetch contracts.
 * @module @finai/shared-types/query-keys
 */

/**
 * Universal query keys catalog for caching and invalidation across TanStack Query.
 */
export const QUERY_KEYS = {
  AI: {
    CONVERSATIONS: ["ai", "conversations"] as const,
    CONVERSATION: (id: string) => ["ai", "conversations", id] as const,
    PAGE_INSIGHT: (page: string) => ["ai", "insight", page] as const,
    PROPOSED_ACTIONS: (convoId?: string) =>
      ["ai", "agent", "actions", "proposed", convoId ?? "all"] as const,
    ACTION_HISTORY: (convoId: string) => ["ai", "agent", "actions", "history", convoId] as const,
  },
  ACCOUNTS: {
    ALL: ["accounts"] as const,
    DETAIL: (id: string) => ["accounts", id] as const,
  },
  TRANSACTIONS: {
    ALL: ["transactions"] as const,
    FILTERED: (filter: unknown) => ["transactions", filter] as const,
    DETAIL: (id: string) => ["transactions", id] as const,
  },
  BUDGETS: {
    ALL: ["budgets"] as const,
    DETAIL: (id: string) => ["budgets", id] as const,
  },
  GOALS: {
    ALL: ["goals"] as const,
    DETAIL: (id: string) => ["goals", id] as const,
  },
  INVESTMENTS: {
    PORTFOLIO: ["investments"] as const,
    DETAIL: (id: string) => ["investments", id] as const,
  },
  CATEGORIES: {
    ALL: ["categories"] as const,
    GROUPS: ["categories", "groups"] as const,
  },
  ANALYTICS: {
    DASHBOARD: ["analytics", "dashboard"] as const,
    MONTHLY: (months?: string | number) => ["analytics", "monthly", String(months ?? "3")] as const,
    HEALTH: ["analytics", "health"] as const,
    CATEGORIES: ["analytics", "categories"] as const,
    SAVINGS_TREND: (months?: string | number) =>
      ["analytics", "savings-trend", String(months ?? "6")] as const,
  },
  INSIGHTS: {
    RECOMMENDATIONS: ["insights", "recommendations"] as const,
  },
  OPTIONS: {
    ALL: ["options"] as const,
    CATEGORY: (cat: string) => ["options", cat] as const,
  },
  USER: {
    PROFILE: ["users", "profile"] as const,
  },
  MENU_ITEMS: {
    ALL: ["menu-items"] as const,
  },
} as const;

export type QueryKeysCatalog = typeof QUERY_KEYS;

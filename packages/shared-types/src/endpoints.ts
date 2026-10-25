/**
 * @file packages/shared-types/src/endpoints.ts
 * @description Single source of truth for REST API endpoint URIs across frontend and backend.
 * @module @finai/shared-types/endpoints
 */

/**
 * REST API route paths consumed by HTTP clients and routing declarations.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "auth/login",
    REGISTER: "auth/register",
    FORGOT_PASSWORD: "auth/forgot-password",
    RESET_PASSWORD: "auth/reset-password",
  },
  USERS: {
    PROFILE: "users/profile",
  },
  AGENT: {
    CHAT: "agent/chat",
    PROPOSED_ACTIONS: "agent/actions/proposed",
    ACTION_HISTORY: "agent/actions/history",
    CONFIRM_ACTION: (id: string) => `agent/actions/${id}/confirm`,
    REJECT_ACTION: (id: string) => `agent/actions/${id}/reject`,
  },
  AI: {
    CONVERSATIONS: "ai/conversations",
    CONVERSATION: (id: string) => `ai/conversations/${id}`,
    CHAT: "ai/chat",
    INSIGHT: "ai/insight",
    SUGGEST_EMOJI: "ai/suggest-emoji",
  },
  ACCOUNTS: {
    BASE: "accounts",
    DETAIL: (id: string) => `accounts/${id}`,
    DEFAULT: (id: string) => `accounts/${id}/default`,
  },
  TRANSACTIONS: {
    BASE: "transactions",
    DETAIL: (id: string) => `transactions/${id}`,
    BULK: "transactions/bulk",
    TEMPLATE: "transactions/template",
  },
  BUDGETS: {
    BASE: "budgets",
    DETAIL: (id: string) => `budgets/${id}`,
  },
  GOALS: {
    BASE: "goals",
    DETAIL: (id: string) => `goals/${id}`,
    CONTRIBUTE: (id: string) => `goals/${id}/contribute`,
  },
  INVESTMENTS: {
    BASE: "investments",
    DETAIL: (id: string) => `investments/${id}`,
    VALUE: (id: string) => `investments/${id}/value`,
  },
  CATEGORIES: {
    BASE: "categories",
    DETAIL: (id: string) => `categories/${id}`,
    GROUPS: "categories/groups",
  },
  ANALYTICS: {
    DASHBOARD: "analytics/dashboard",
    MONTHLY: "analytics/monthly",
    CATEGORIES: "analytics/categories",
    HEALTH: "analytics/health",
    SAVINGS_TREND: "analytics/savings-trend",
  },
  INSIGHTS: {
    RECOMMENDATIONS: "insights/recommendations",
  },
  OPTIONS: {
    BASE: "options",
    CATEGORY: (cat: string) => `options/${cat}`,
  },
  MENU_ITEMS: {
    BASE: "menu-items",
  },
  SEARCH: {
    BASE: "search",
  },
  WORKSPACES: {
    BASE: "workspaces",
    DETAIL: (id: string) => `workspaces/${id}`,
    MEMBERS: (id: string) => `workspaces/${id}/members`,
    MEMBER: (workspaceId: string, memberId: string) =>
      `workspaces/${workspaceId}/members/${memberId}`,
    LEAVE: (id: string) => `workspaces/${id}/leave`,
    INVITATIONS: (id: string) => `workspaces/${id}/invitations`,
    INVITATION: (workspaceId: string, inviteId: string) =>
      `workspaces/${workspaceId}/invitations/${inviteId}`,
    MY_INVITATIONS: "workspaces/invitations/me",
    ACCEPT_INVITATION: (id: string) => `workspaces/invitations/${id}/accept`,
    REJECT_INVITATION: (id: string) => `workspaces/invitations/${id}/reject`,
  },
  NOTIFICATIONS: {
    BASE: "notifications",
    DETAIL: (id: string) => `notifications/${id}`,
    READ: (id: string) => `notifications/${id}/read`,
    READ_ALL: "notifications/read-all",
    UNREAD_COUNT: "notifications/unread-count",
  },
} as const;

export type ApiEndpointsCatalog = typeof API_ENDPOINTS;

/**
 * DevLab Central Portal SSO route paths and default application identifier.
 * Single source of truth for SSO query parameters and auth redirection routes.
 */
export const DEVLAB_CONFIG = {
  APP_ID: "finai",
  PATHS: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },
} as const;

export type DevLabConfigCatalog = typeof DEVLAB_CONFIG;

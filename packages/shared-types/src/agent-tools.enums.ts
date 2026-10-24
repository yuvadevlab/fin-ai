/**
 * @file packages/shared-types/src/agent-tools.enums.ts
 * @description Canonical tool names and capabilities for the FinAI autonomous agent runtime.
 * @module @finai/shared-types/agent-tools
 */

/** Canonical tool identifiers dispatched by the FinAI agent tool orchestrator */
export const AgentToolName = {
  // Transactions
  TRANSACTIONS_CREATE: "transactions.create",
  TRANSACTIONS_BULK_CREATE: "transactions.bulkCreate",
  TRANSACTIONS_UPDATE: "transactions.update",
  TRANSACTIONS_DELETE: "transactions.delete",
  TRANSACTIONS_LIST: "transactions.list",
  TRANSACTIONS_GET: "transactions.get",
  TRANSACTIONS_RECATEGORIZE_PREVIEW: "transactions.recategorize",
  TRANSACTIONS_RECATEGORIZE_APPLY: "transactions.recategorizeApply",

  // Accounts
  ACCOUNTS_LIST: "accounts.list",
  ACCOUNTS_GET: "accounts.get",
  ACCOUNTS_CREATE: "accounts.create",
  ACCOUNTS_UPDATE: "accounts.update",
  ACCOUNTS_DELETE: "accounts.delete",
  ACCOUNTS_SET_DEFAULT: "accounts.setDefault",

  // Budgets
  BUDGETS_LIST: "budgets.list",
  BUDGETS_GET: "budgets.get",
  BUDGETS_CREATE: "budgets.create",
  BUDGETS_UPDATE: "budgets.update",
  BUDGETS_DELETE: "budgets.delete",

  // Categories
  CATEGORIES_LIST: "categories.list",
  CATEGORIES_GET: "categories.get",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_UPDATE: "categories.update",
  CATEGORIES_DELETE: "categories.delete",

  // Goals
  GOALS_LIST: "goals.list",
  GOALS_GET: "goals.get",
  GOALS_CREATE: "goals.create",
  GOALS_UPDATE: "goals.update",
  GOALS_CONTRIBUTE: "goals.contribute",
  GOALS_DELETE: "goals.delete",

  // Analytics & Insights
  ANALYTICS_OVERVIEW: "analytics.overview",
  ANALYTICS_MONTHLY: "analytics.monthly",
  ANALYTICS_CATEGORIES: "analytics.categories",
  ANALYTICS_SAVINGS_TREND: "analytics.savingsTrend",
  INSIGHTS_HEALTH_SCORE: "insights.healthScore",

  // Search & Navigation
  SEARCH_ALL: "search.all",
} as const;

export type AgentToolName = (typeof AgentToolName)[keyof typeof AgentToolName];

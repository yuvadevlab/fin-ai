/**
 * @file packages/shared-types/src/agent-tools.enums.ts
 * @description Canonical tool names, LLM providers, and capabilities for the FinAI autonomous agent runtime.
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
  TRANSACTIONS_SUMMARIZE: "transactions.summarize",
  TRANSACTIONS_RECATEGORIZE_PREVIEW: "transactions.recategorize",
  TRANSACTIONS_RECATEGORIZE_APPLY: "transactions.recategorizeApply",

  // Accounts
  ACCOUNTS_LIST: "accounts.list",
  ACCOUNTS_GET: "accounts.get",
  ACCOUNTS_CREATE: "accounts.create",
  ACCOUNTS_RENAME: "accounts.rename",
  ACCOUNTS_UPDATE: "accounts.update",
  ACCOUNTS_DELETE: "accounts.delete",
  ACCOUNTS_SET_DEFAULT: "accounts.setDefault",

  // Budgets
  BUDGETS_LIST: "budgets.list",
  BUDGETS_GET: "budgets.get",
  BUDGETS_CREATE: "budgets.create",
  BUDGETS_UPDATE: "budgets.update",
  BUDGETS_DELETE: "budgets.delete",
  BUDGETS_TRANSFER_ALLOCATION: "budgets.transferAllocation",

  // Categories
  CATEGORIES_LIST: "categories.list",
  CATEGORIES_GET: "categories.get",
  CATEGORIES_RESOLVE: "categories.resolve",
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
  ANALYTICS_DASHBOARD: "analytics.dashboard",
  ANALYTICS_HEALTH_SCORE: "analytics.healthScore",
  ANALYTICS_MONTHLY_CASH_FLOW: "analytics.monthlyCashFlow",
  ANALYTICS_RECOMMENDATIONS: "analytics.recommendations",
  ANALYTICS_OVERVIEW: "analytics.overview",
  ANALYTICS_MONTHLY: "analytics.monthly",
  ANALYTICS_CATEGORIES: "analytics.categories",
  ANALYTICS_SAVINGS_TREND: "analytics.savingsTrend",
  INSIGHTS_SAFE_TO_SPEND: "insights.safeToSpend",
  INSIGHTS_HEALTH_SCORE: "insights.healthScore",

  // Investments
  INVESTMENTS_LIST: "investments.list",
  INVESTMENTS_CREATE: "investments.create",
  INVESTMENTS_UPDATE_VALUE: "investments.updateValue",
  INVESTMENTS_DELETE: "investments.delete",

  // Profile
  PROFILE_GET: "profile.get",
  PROFILE_UPDATE: "profile.update",
  PROFILE_SET_DEFAULT_ACCOUNT: "profile.setDefaultAccount",

  // Search & Navigation
  SEARCH_ALL: "search.all",
  SEARCH_EVERYTHING: "search.everything",

  // Action management
  ACTION_PATCH: "action.patch",
  ACTION_CONFIRM: "action.confirm",
} as const;

export type AgentToolName = (typeof AgentToolName)[keyof typeof AgentToolName];

/** Supported external AI model provider identifiers */
export const AiProvider = {
  OPENROUTER: "openrouter",
  GROQ: "groq",
  GOOGLE_AI_STUDIO: "google-ai-studio",
  OLLAMA: "ollama",
} as const;

export type AiProvider = (typeof AiProvider)[keyof typeof AiProvider];

/** Operational role for an LLM runtime instance */
export const AiProviderRole = {
  AGENT: "agent",
  CHAT: "chat",
} as const;

export type AiProviderRole = (typeof AiProviderRole)[keyof typeof AiProviderRole];

/** Tool execution access level determining whether confirmation is possible */
export const ToolAccessLevel = {
  READ: "read",
  WRITE: "write",
} as const;

export type ToolAccessLevel = (typeof ToolAccessLevel)[keyof typeof ToolAccessLevel];

/** Tool confirmation requirement level */
export const ToolConfirmationType = {
  REQUIRED: "required",
  OPTIONAL: "optional",
  NONE: "none",
} as const;

export type ToolConfirmationType = (typeof ToolConfirmationType)[keyof typeof ToolConfirmationType];

/** Standardized UI labels for interactive confirmation card rows */
export const ConfirmationRowLabel = {
  TYPE: "Type",
  AMOUNT: "Amount",
  DATE: "Date",
  ACCOUNT: "Account",
  CATEGORY: "Category",
  TO_ACCOUNT: "To account",
  NOTES: "Notes",
  NAME: "Name",
  INSTITUTION: "Institution",
  BALANCE: "Balance",
  OPENING_BALANCE: "Opening balance",
  CURRENCY: "Currency",
  SET_AS_DEFAULT: "Set as default",
  LIMIT: "Limit",
  NEW_LIMIT: "New limit",
  START_DATE: "Start date",
  PERIOD: "Period",
  TARGET: "Target",
  TARGET_AMOUNT: "Target amount",
  TARGET_DATE: "Target date",
  DEADLINE: "Deadline",
  GOAL_TYPE: "Goal type",
  CURRENT_AMOUNT: "Current amount",
  ALREADY_SAVED: "Already saved",
  SAVED: "Saved",
  MATCHED_COUNT: "Matched transactions",
  TARGET_CATEGORY: "Target category",
  FROM_CATEGORY: "From category",
  TO_CATEGORY: "To category",
  CURRENT_CATEGORY_ID: "Current category ID",
  NOTES_CONTAIN: "Notes contain",
  FROM: "From",
  TO: "To",
  UNRESOLVED: "Unresolved",
  DEFAULT: "Default",
  TRANSACTION_ID: "Transaction ID",
  ACCOUNT_ID: "Account ID",
  TO_ACCOUNT_ID: "To account ID",
  CATEGORY_ID: "Category ID",
  GOAL_ID: "Goal ID",
  INVESTMENT_ID: "Investment ID",
  FROM_BUDGET_ID: "From budget ID",
  TO_BUDGET_ID: "To budget ID",
  WARNING: "Warning",
  EFFECT: "Effect",
  GROUP: "Group",
  ICON: "Icon",
  ASSET_CLASS: "Asset class",
  CURRENT_VALUE: "Current value",
  INVESTED_AMOUNT: "Invested amount",
  NEW_CURRENT_VALUE: "New current value",
  EMAIL: "Email",
  PREFERENCES: "Preferences",
  BULK_COUNT: "__bulk_count__",
  BULK_TOTAL: "__bulk_total__",
} as const;

export type ConfirmationRowLabel = (typeof ConfirmationRowLabel)[keyof typeof ConfirmationRowLabel];

export const BULK_ITEM_PREFIX = "__item_";

/** Cache invalidation tag keys emitted upon tool execution */
export const ToolInvalidationTag = {
  TRANSACTIONS: "transactions",
  ACCOUNTS: "accounts",
  ANALYTICS: "analytics",
  BUDGETS: "budgets",
  GOALS: "goals",
  CATEGORIES: "categories",
  INVESTMENTS: "investments",
  USER_PROFILE: "user-profile",
  PROFILE: "profile",
} as const;

export type ToolInvalidationTag = (typeof ToolInvalidationTag)[keyof typeof ToolInvalidationTag];

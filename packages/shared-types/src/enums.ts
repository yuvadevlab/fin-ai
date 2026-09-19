/**
 * Types of financial accounts a user can link.
 *
 * BANK: traditional savings/current account
 * CREDIT_CARD: credit card (tracked as a liability)
 * WALLET: digital wallets (Paytm, PhonePe, GPay, etc.)
 * CASH: physical cash on hand
 */
export const AccountType = {
  BANK: "BANK",
  CREDIT_CARD: "CREDIT_CARD",
  WALLET: "WALLET",
  CASH: "CASH",
} as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

/**
 * Types of financial transactions.
 *
 * INCOME: money in (salary, refunds, etc.)
 * EXPENSE: money out (purchases, bills, etc.)
 * TRANSFER: movement between the user's own accounts (no net worth change)
 * INVESTMENT: money moved into an investment vehicle
 * GOAL: money contributed towards a savings goal
 */
export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  TRANSFER: "TRANSFER",
  INVESTMENT: "INVESTMENT",
  GOAL: "GOAL",
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

/** Budget health status — computed by comparing spending against the limit. */
export const BudgetStatus = {
  ON_TRACK: "ON_TRACK",
  NEAR_LIMIT: "NEAR_LIMIT",
  OVER: "OVER",
} as const;
export type BudgetStatus = (typeof BudgetStatus)[keyof typeof BudgetStatus];

export const GoalType = {
  EMERGENCY_FUND: "EMERGENCY_FUND",
  OBLIGATION: "OBLIGATION",
  LIFESTYLE: "LIFESTYLE",
  PERSONAL: "PERSONAL",
} as const;
export type GoalType = (typeof GoalType)[keyof typeof GoalType];

export const MessageRole = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
  SYSTEM: "SYSTEM",
} as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

export const AssetClass = {
  MUTUAL_FUND: "MUTUAL_FUND",
  STOCK: "STOCK",
  FIXED_DEPOSIT: "FIXED_DEPOSIT",
  GOLD: "GOLD",
  EPF: "EPF",
  PPF: "PPF",
  REAL_ESTATE: "REAL_ESTATE",
  CRYPTO: "CRYPTO",
  OTHER: "OTHER",
} as const;
export type AssetClass = (typeof AssetClass)[keyof typeof AssetClass];

export const NotificationType = {
  BUDGET_WARNING: "BUDGET_WARNING",
  BUDGET_EXCEEDED: "BUDGET_EXCEEDED",
  GOAL_COMPLETED: "GOAL_COMPLETED",
  GOAL_MILESTONE: "GOAL_MILESTONE",
  AI_INSIGHT: "AI_INSIGHT",
  SYSTEM: "SYSTEM",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const ReferenceOptionCategory = {
  TRANSACTION_TYPE: "TRANSACTION_TYPE",
  ASSET_CLASS: "ASSET_CLASS",
  GOAL_TYPE: "GOAL_TYPE",
} as const;
export type ReferenceOptionCategory =
  (typeof ReferenceOptionCategory)[keyof typeof ReferenceOptionCategory];

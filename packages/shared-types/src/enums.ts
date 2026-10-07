/**
 * @file packages/shared-types/src/enums.ts
 * @description Canonical domain enums and lookup types for the FinAI monorepo.
 * @module @finai/shared-types/enums
 */

/**
 * Types of financial accounts a user can link.
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
  AT_LIMIT: "AT_LIMIT",
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
  ACCOUNT_TYPE: "ACCOUNT_TYPE",
  APP_CONFIG: "APP_CONFIG",
} as const;
export type ReferenceOptionCategory =
  (typeof ReferenceOptionCategory)[keyof typeof ReferenceOptionCategory];

/** Agent execution mode determining tool loop availability */
export const AgentMode = {
  AGENT: "agent",
  CHAT: "chat",
} as const;
export type AgentMode = (typeof AgentMode)[keyof typeof AgentMode];

/** Status of proposed agent actions awaiting confirmation or executed */
export const AgentActionStatus = {
  PROPOSED: "PROPOSED",
  EXECUTED: "EXECUTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
} as const;
export type AgentActionStatus = (typeof AgentActionStatus)[keyof typeof AgentActionStatus];

/** Presentation card categories returned during conversational turns */
export const AgentCardType = {
  INSIGHT: "insight",
  TABLE: "table",
  CONFIRMATION: "confirmation",
  ENTITY: "entity",
} as const;
export type AgentCardType = (typeof AgentCardType)[keyof typeof AgentCardType];

/** Lifecycle execution phases emitted during SSE stream */
export const ExecutionPhase = {
  LOADING_CONTEXT: "loading_context",
  AGENT_LOOP: "agent_loop",
  SYNTHESIZING: "synthesizing",
} as const;
export type ExecutionPhase = (typeof ExecutionPhase)[keyof typeof ExecutionPhase];

/** Browser local and session storage keys used across client applications */
export const StorageKey = {
  TOKEN: "finai_token",
  THEME: "finai_theme",
  CHAT_CACHE_PREFIX: "finai_chat_cache_",
  ACTIVE_CONVERSATION: "finai_active_conversation_id",
} as const;
export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey];

/** Server-Sent Event stream event types emitted during agent execution */
export const AgentStreamEventType = {
  RUN: "run",
  PHASE: "phase",
  MODE: "mode",
  CONVERSATION: "conversation",
  TITLE: "title",
  TEXT: "text",
  TOOL_START: "tool_start",
  TOOL_END: "tool_end",
  CONFIRMATION: "confirmation",
  STATUS: "status",
  ERROR: "error",
  DONE: "done",
} as const;
export type AgentStreamEventType = (typeof AgentStreamEventType)[keyof typeof AgentStreamEventType];

/** Phase progression boundary states */
export const PhaseStatus = {
  START: "start",
  END: "end",
} as const;
export type PhaseStatus = (typeof PhaseStatus)[keyof typeof PhaseStatus];

/** Query search parameter identifiers consumed across routes and endpoints */
export const SEARCH_PARAMS = {
  PAGE: "page",
  MONTHS: "months",
  CATEGORY: "category",
  CONVERSATION_ID: "conversationId",
  QUERY: "q",
} as const;
export type SearchParamKey = (typeof SEARCH_PARAMS)[keyof typeof SEARCH_PARAMS];

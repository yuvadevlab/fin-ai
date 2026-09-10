/**
 * @module shared-types
 *
 * **Purpose:** Single source of truth for all shared TypeScript types,
 * enums, and DTOs across the FinAI monorepo.
 *
 * Both `apps/web` and `apps/api` import from this package. Per AGENTS.md,
 * never duplicate a type here into an app or another package.
 *
 * Key sections below:
 * - Enums (AccountType, TransactionType, etc.)
 * - Domain models (User, Account, Transaction, Category, etc.)
 * - API types (ApiResponse, PaginationParams, etc.)
 * - Analytics types (DashboardSummary, etc.)
 * - AI types (ChatRequest, ChatStreamEvent)
 */

// ─── Enums ─────────────────────────────────────────────────────────────────

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

// ─── Model Types ─────────────────────────────────────────────────────────────

export interface UserPreferences {
  notifications?: Record<string, boolean>;
  appearance?: Record<string, string | boolean>;
  security?: Record<string, boolean>;
  defaultAccountId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  isDefault?: boolean;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId?: string | null;
  categoryId: string;
  investmentId?: string | null;
  goalId?: string | null;
  amount: number;
  date: string;
  notes?: string;
  type: TransactionType;
  account?: Account;
  toAccount?: Account | null;
  category?: Category;
  investment?: Investment | null;
  goal?: Goal | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  order: number;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  group: string;
  groupId?: string | null;
  icon?: string | null;
  isDefault?: boolean;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  limit: number;
  spent: number;
  startDate: string;
  category?: Category;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  type?: GoalType;
  createdAt: string;
  updatedAt: string;
  transactions?: Transaction[];
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  assetClass: AssetClass;
  currentValue: number;
  investedAmount: number;
  allocation?: number;
  change?: number;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
  transactions?: Transaction[];
}

export { HEALTH_DATA_QUALITY, HEALTH_METRIC_KEYS, HEALTH_METRIC_STATUSES } from "./health.types";
export type {
  HealthDataQuality,
  HealthMetric,
  HealthMetricKey,
  HealthMetricStatus,
  HealthMetricUnit,
  HealthScore,
} from "./health.types";
export {
  HEALTH_METRIC_LABELS,
  HEALTH_METRIC_WEIGHTS,
  HEALTH_RATINGS,
  HEALTH_TARGETS,
} from "./health.constants";

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata;
  createdAt: string;
}

export interface MessageMetadata {
  card?: InsightCard;
  sources?: string[];
}

export interface InsightCard {
  title: string;
  rows: [string, string][];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TransactionFilterParams extends PaginationParams, SortParams {
  category?: string;
  account?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// ─── Reference Options ────────────────────────────────────────────────────────

export const ReferenceOptionCategory = {
  TRANSACTION_TYPE: "TRANSACTION_TYPE",
  ASSET_CLASS: "ASSET_CLASS",
  GOAL_TYPE: "GOAL_TYPE",
} as const;
export type ReferenceOptionCategory =
  (typeof ReferenceOptionCategory)[keyof typeof ReferenceOptionCategory];

export interface ReferenceOption {
  id: string;
  category: string;
  label: string;
  value: string;
  order: number;
  isActive: boolean;
}

// ─── Dashboard / Analytics Types ─────────────────────────────────────────────

export interface CashFlowDataPoint {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdownItem {
  name: string;
  value: number;
}

export interface SavingsTrendPoint {
  month: string;
  value: number;
}

export interface KpiTrend {
  value: string;
  kind: "up" | "down" | "flat";
}

export interface DashboardSummary {
  netBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  cashFlow: CashFlowDataPoint[];
  categoryBreakdown: CategoryBreakdownItem[];
  savingsTrend: SavingsTrendPoint[];
  investmentValue: number;
  investmentChangeYTD: number;
  budgetStatus: { onTrack: number; total: number };
  monthlySavings: number;
}

// ─── AI Types ────────────────────────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatStreamEvent {
  type: "token" | "card" | "done" | "error";
  content?: string;
  card?: InsightCard;
  conversationId?: string;
  error?: string;
}

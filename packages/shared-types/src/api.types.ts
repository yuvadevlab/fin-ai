import type { TransactionType } from "./enums";
import type { InsightCard } from "./models";

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

export interface ReferenceOption {
  id: string;
  category: string;
  label: string;
  value: string;
  order: number;
  isActive: boolean;
}

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

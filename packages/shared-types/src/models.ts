import type {
  AccountType,
  AssetClass,
  GoalType,
  MessageRole,
  NotificationType,
  TransactionType,
} from "./enums";

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

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsightCard {
  title: string;
  rows: [string, string][];
}

export interface MessageMetadata {
  card?: InsightCard;
  sources?: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata;
  createdAt: string;
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

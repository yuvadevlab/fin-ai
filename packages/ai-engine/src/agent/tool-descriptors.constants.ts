/**
 * @file packages/ai-engine/src/agent/tool-descriptors.constants.ts
 * @description Centralized, reusable tool descriptions, progress labels, and confirmation titles.
 * Eliminates ad-hoc duplicated string literals across tool definitions.
 * @module @finai/ai-engine/agent/tool-descriptors
 */

import { AgentToolName } from "@finai/shared-types";

/** Reusable tool descriptions instructing LLM model on tool parameters and semantics */
export const AGENT_TOOL_DESCRIPTIONS = {
  [AgentToolName.TRANSACTIONS_CREATE]:
    "Record a new transaction for the user. Requires confirmation. Fields: amount (positive number), optional type (INCOME | EXPENSE | TRANSFER | INVESTMENT, defaults to EXPENSE), account (HDFC account name or accountId), category (e.g. 'groceries' resolving to 'Groceries & Supermarket', or categoryId), optional toAccount (required for TRANSFER), optional notes (max 500 chars). Date: if the user names a date (e.g. 'yesterday', '2 days back', 'aug 15', 'tomorrow', 'last week'), extract that phrase verbatim into dateExpression and also set date to the best-matching YYYY-MM-DD; if the user gives NO date, OMIT date and dateExpression entirely (the server records today). Category and account are resolved to the user's real records server-side — never invent IDs. Account balances update automatically.",

  [AgentToolName.TRANSACTIONS_BULK_CREATE]:
    "Record multiple transactions in one atomic batch (max 25). Requires confirmation. Each item uses the same fields as transactions.create (amount, optional type defaulting to EXPENSE, account/category by name or ID; if the user names a date, pass it verbatim in dateExpression; OMIT date/dateExpression when no date is given so the server records today). Use for import-style requests like 'add these three expenses'.",

  [AgentToolName.TRANSACTIONS_UPDATE]:
    "Update an existing transaction's amount, date, notes, category, accounts or type. Requires confirmation. Balances rebalance automatically. Pass only the fields that should change; account/category accept a name or ID. For dates, follow the same rule as transactions.create: pass the user's wording in dateExpression ('yesterday', 'aug 15'), or set date directly; omit both to leave the date unchanged. Set toAccountId: null to clear a destination account.",

  [AgentToolName.TRANSACTIONS_DELETE]:
    "Delete an existing transaction. Requires confirmation. Account balance rebalances automatically.",

  [AgentToolName.TRANSACTIONS_LIST]:
    "List the user's recent transactions with optional filters by category, account, type (INCOME, EXPENSE, TRANSFER, INVESTMENT, GOAL), date range (YYYY-MM-DD), search text, and limit (max 50, default 20). Returns sorted descending by date.",

  [AgentToolName.TRANSACTIONS_GET]: "Get detailed information for a single transaction by its ID.",

  [AgentToolName.TRANSACTIONS_RECATEGORIZE_PREVIEW]:
    "Preview the impact of re-categorizing transactions from one category to another without modifying records. Returns matched transaction count and sample items.",

  [AgentToolName.TRANSACTIONS_RECATEGORIZE_APPLY]:
    "Apply transaction re-categorization from one category to another. Requires confirmation.",

  [AgentToolName.ACCOUNTS_LIST]:
    "List all accounts belonging to the user with their current balances, account types, and institution names.",

  [AgentToolName.ACCOUNTS_GET]:
    "Get detailed balance and configuration information for a single account by ID or name.",

  [AgentToolName.ACCOUNTS_CREATE]:
    "Create a new financial account (e.g. Bank Account, Credit Card, Wallet, Cash). Requires confirmation.",

  [AgentToolName.ACCOUNTS_UPDATE]:
    "Update account details such as name, institution, or color. Requires confirmation.",

  [AgentToolName.ACCOUNTS_DELETE]:
    "Delete an account and its balance history. Requires confirmation. This operation cannot be undone.",

  [AgentToolName.ACCOUNTS_SET_DEFAULT]:
    "Set an account as the user's default account for new transactions.",

  [AgentToolName.BUDGETS_LIST]:
    "List all spending budgets for the current period with limit, current spending, and variance percentages.",

  [AgentToolName.BUDGETS_GET]: "Get details for a specific budget by ID or category name.",

  [AgentToolName.BUDGETS_CREATE]:
    "Create a new monthly spending budget for a category. Requires confirmation.",

  [AgentToolName.BUDGETS_UPDATE]: "Update a monthly spending budget limit. Requires confirmation.",

  [AgentToolName.BUDGETS_DELETE]: "Delete a spending budget. Requires confirmation.",

  [AgentToolName.CATEGORIES_LIST]:
    "List all expense and income categories available in the user's workspace.",

  [AgentToolName.CATEGORIES_GET]: "Get details for a single category by name or ID.",

  [AgentToolName.CATEGORIES_CREATE]:
    "Create a new spending or income category. Requires confirmation.",

  [AgentToolName.CATEGORIES_UPDATE]:
    "Update a category name, group, or icon. Requires confirmation.",

  [AgentToolName.CATEGORIES_DELETE]: "Delete a category. Requires confirmation.",

  [AgentToolName.GOALS_LIST]:
    "List all financial goals with targets, saved amounts, deadlines, and progress percentages.",

  [AgentToolName.GOALS_GET]: "Get details for a single financial goal by ID or name.",

  [AgentToolName.GOALS_CREATE]:
    "Create a new savings goal (target amount, target date, goal type). Requires confirmation.",

  [AgentToolName.GOALS_UPDATE]:
    "Update goal parameters like target amount or deadline. Requires confirmation.",

  [AgentToolName.GOALS_CONTRIBUTE]:
    "Contribute funds from an account to a savings goal. Requires confirmation.",

  [AgentToolName.GOALS_DELETE]: "Delete a savings goal. Requires confirmation.",

  [AgentToolName.ANALYTICS_OVERVIEW]:
    "Get an executive summary of income, expenses, net savings, and savings rate for the selected month or date range.",

  [AgentToolName.ANALYTICS_MONTHLY]:
    "Get monthly income vs. expense breakdown for the past 6 to 12 months.",

  [AgentToolName.ANALYTICS_CATEGORIES]:
    "Get spending breakdown grouped by categories for a month or date range.",

  [AgentToolName.ANALYTICS_SAVINGS_TREND]:
    "Get savings rate and net wealth accumulation trend analysis across months.",

  [AgentToolName.INSIGHTS_HEALTH_SCORE]:
    "Calculate the holistic FinAI financial health score (0-100) based on liquidity, debt, savings, and budget discipline.",

  [AgentToolName.SEARCH_ALL]:
    "Universal search across transactions, accounts, budgets, goals, and categories matching query keywords.",
} as const;

/** User-facing execution status labels streamed during agent tool execution */
export const AGENT_TOOL_LABELS = {
  [AgentToolName.TRANSACTIONS_CREATE]: "Recording your transaction",
  [AgentToolName.TRANSACTIONS_BULK_CREATE]: "Recording multiple transactions",
  [AgentToolName.TRANSACTIONS_UPDATE]: "Updating transaction",
  [AgentToolName.TRANSACTIONS_DELETE]: "Deleting transaction",
  [AgentToolName.TRANSACTIONS_RECATEGORIZE_APPLY]: "Re-categorizing transactions",
  [AgentToolName.ACCOUNTS_CREATE]: "Creating financial account",
  [AgentToolName.ACCOUNTS_UPDATE]: "Updating account",
  [AgentToolName.ACCOUNTS_DELETE]: "Deleting account",
  [AgentToolName.ACCOUNTS_SET_DEFAULT]: "Setting default account",
  [AgentToolName.BUDGETS_CREATE]: "Creating spending budget",
  [AgentToolName.BUDGETS_UPDATE]: "Updating budget limit",
  [AgentToolName.BUDGETS_DELETE]: "Deleting budget",
  [AgentToolName.CATEGORIES_CREATE]: "Creating category",
  [AgentToolName.CATEGORIES_UPDATE]: "Updating category",
  [AgentToolName.CATEGORIES_DELETE]: "Deleting category",
  [AgentToolName.GOALS_CREATE]: "Creating savings goal",
  [AgentToolName.GOALS_UPDATE]: "Updating goal",
  [AgentToolName.GOALS_CONTRIBUTE]: "Recording goal contribution",
  [AgentToolName.GOALS_DELETE]: "Deleting savings goal",
} as const;

/** Canonical confirmation card titles presented in the interactive UI */
export const AGENT_TOOL_TITLES = {
  [AgentToolName.TRANSACTIONS_CREATE]: "Record transaction",
  [AgentToolName.TRANSACTIONS_UPDATE]: "Update transaction",
  [AgentToolName.TRANSACTIONS_DELETE]: "Delete transaction",
  [AgentToolName.TRANSACTIONS_RECATEGORIZE_APPLY]: "Re-categorize transactions",
  [AgentToolName.ACCOUNTS_CREATE]: "Create account",
  [AgentToolName.ACCOUNTS_UPDATE]: "Update account",
  [AgentToolName.ACCOUNTS_DELETE]: "Delete account",
  [AgentToolName.BUDGETS_CREATE]: "Create budget",
  [AgentToolName.BUDGETS_UPDATE]: "Update budget",
  [AgentToolName.BUDGETS_DELETE]: "Delete budget",
  [AgentToolName.GOALS_CREATE]: "Create goal",
  [AgentToolName.GOALS_UPDATE]: "Update goal",
  [AgentToolName.GOALS_CONTRIBUTE]: "Contribute to goal",
  [AgentToolName.GOALS_DELETE]: "Delete goal",
} as const;

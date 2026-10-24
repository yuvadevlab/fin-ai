/**
 * @file packages/ai-engine/src/agent/tool-descriptors.descriptions.ts
 * @description Centralized, reusable descriptions instructing LLMs on agent tool parameters and semantics.
 * @module @finai/ai-engine/agent/tool-descriptors-descriptions
 */

import { AgentToolName } from "@finai/shared-types";

/** Reusable tool descriptions instructing LLM model on tool parameters and semantics */
export const AGENT_TOOL_DESCRIPTIONS: Record<string, string> = {
  [AgentToolName.TRANSACTIONS_CREATE]:
    "Record a new transaction for the user. Requires confirmation. Fields: amount (positive number), optional type (INCOME | EXPENSE | TRANSFER | INVESTMENT, defaults to EXPENSE), account (HDFC account name or accountId), category (e.g. 'groceries' resolving to 'Groceries & Supermarket', or categoryId), optional toAccount (required for TRANSFER), optional notes (max 500 chars). Date: if the user names a date (e.g. 'yesterday', '2 days back', 'aug 15', 'tomorrow', 'last week'), extract that phrase verbatim into dateExpression and also set date to the best-matching YYYY-MM-DD; if the user gives NO date, OMIT date and dateExpression entirely (the server records today). Category and account are resolved to the user's real records server-side — never invent IDs. Account balances update automatically.",

  [AgentToolName.TRANSACTIONS_BULK_CREATE]:
    "Record multiple transactions in one atomic batch (max 25). Requires confirmation. Each item uses the same fields as transactions.create (amount, optional type defaulting to EXPENSE, account/category by name or ID; if the user names a date, pass it verbatim in dateExpression; OMIT date/dateExpression when no date is given so the server records today). Use for import-style requests like 'add these three expenses'.",

  [AgentToolName.TRANSACTIONS_UPDATE]:
    "Update an existing transaction's amount, date, notes, category, accounts or type. Requires confirmation. Balances rebalance automatically. Pass only the fields that should change; account/category accept a name or ID. For dates, follow the same rule as transactions.create: pass the user's wording in dateExpression ('yesterday', 'aug 15'), or set date directly; omit both to leave the date unchanged. Set toAccountId: null to clear a destination account.",

  [AgentToolName.TRANSACTIONS_DELETE]:
    "Permanently delete one of the user's transactions and revert its balance impact. Requires confirmation — this is destructive and cannot be undone.",

  [AgentToolName.TRANSACTIONS_LIST]:
    "List the user's transactions with optional filters (date range, category, account, type, search) and pagination. Returns items plus total count.",

  [AgentToolName.TRANSACTIONS_GET]: "Get detailed information for a single transaction by its ID.",

  [AgentToolName.TRANSACTIONS_SUMMARIZE]:
    "Aggregate transaction totals over a date range, grouped by category name or transaction type. Fields: optional dateFrom (YYYY-MM-DD or ISO datetime, defaults to start of current month), optional dateTo (YYYY-MM-DD or ISO datetime, defaults to end of month), groupBy ('category' or 'type', defaults to 'category').",

  [AgentToolName.TRANSACTIONS_RECATEGORIZE_PREVIEW]:
    "DRY-RUN ONLY: count the user's transactions matching a filter that would be re-categorized to a target category. Nothing is changed. Run this first, report the matched count to the user, then propose transactions.recategorizeApply for confirmation. targetCategory accepts a category name or ID.",

  [AgentToolName.TRANSACTIONS_RECATEGORIZE_APPLY]:
    "Apply a re-categorization: move ALL transactions matching a filter to a target category, as counted by the transactions.recategorize dry-run. Requires confirmation. Only the category changes — account balances are never touched. targetCategory accepts a category name or ID.",

  [AgentToolName.ACCOUNTS_LIST]:
    "List the user's active FinAI accounts with balances, types, and the default account flag. Use this to resolve account names (e.g. 'my HDFC account') to IDs.",

  [AgentToolName.ACCOUNTS_GET]:
    "Get details of a single account by ID. Use this to confirm an account exists and check its current balance before recording a transaction against it.",

  [AgentToolName.ACCOUNTS_CREATE]:
    "Create (link) a new FinAI account for the user. Requires confirmation. Fields: name, type (BANK | CREDIT_CARD | WALLET | CASH), optional opening balance (defaults 0), currency (defaults INR), optional isDefault flag.",

  [AgentToolName.ACCOUNTS_RENAME]:
    "Rename one of the user's FinAI accounts. Safe cosmetic change — no confirmation needed. Resolve the account ID with accounts.list first.",

  [AgentToolName.ACCOUNTS_UPDATE]:
    "Update an account's balance or mark it as the user's default account. Requires confirmation. Only name, balance and isDefault are supported; type and currency cannot be changed.",

  [AgentToolName.ACCOUNTS_DELETE]:
    "Deactivate (soft-delete) one of the user's FinAI accounts. Requires confirmation. The account is hidden from the app but its history is retained; transactions are not deleted.",

  [AgentToolName.ACCOUNTS_SET_DEFAULT]:
    "Set an account as the user's default account for new transactions.",

  [AgentToolName.BUDGETS_LIST]:
    "List the user's budgets with their monthly limits and current spending status (ON_TRACK / NEAR_LIMIT / AT_LIMIT / OVER).",

  [AgentToolName.BUDGETS_GET]: "Get details for a specific budget by ID or category name.",

  [AgentToolName.BUDGETS_CREATE]:
    "Create a spending budget for one of the user's categories. Requires confirmation. Fields: category (name or ID, e.g. 'Healthcare', 'Groceries'), limit (positive number), optional start date (YYYY-MM-DD).",

  [AgentToolName.BUDGETS_UPDATE]:
    "Change a budget's spending limit. Requires confirmation. Accepts budgetId OR category name (e.g. 'Groceries', 'Dining Out'), and new limit.",

  [AgentToolName.BUDGETS_DELETE]:
    "Permanently delete one of the user's budgets. Requires confirmation. Accepts budgetId OR category name.",

  [AgentToolName.BUDGETS_TRANSFER_ALLOCATION]:
    "Composite: move part of one budget's limit to another budget atomically (reduces the source limit, increases the target). Requires confirmation. Resolve both budget IDs with budgets.list first.",

  [AgentToolName.CATEGORIES_LIST]:
    "List the user's spending/income categories with their group and icon. Auto-seeds default categories for new users. Prefer reusing these categories over creating new ones.",

  [AgentToolName.CATEGORIES_RESOLVE]:
    "Resolve a vague category name (e.g. 'food', 'groceries', 'rent') to the user's actual category IDs using fuzzy matching ('groceries' matches 'Groceries & Supermarket'). Use this before creating budgets or re-categorizing transactions when the user refers to a category loosely.",

  [AgentToolName.CATEGORIES_GET]: "Get details for a single category by name or ID.",

  [AgentToolName.CATEGORIES_CREATE]:
    "Create a new custom category for the user. Requires confirmation. Fields: name (max 50 chars), optional group name (defaults 'Variable Expenses'), optional icon name.",

  [AgentToolName.CATEGORIES_UPDATE]:
    "Rename or restyle one of the user's categories. Requires confirmation. Only pass the fields that should change.",

  [AgentToolName.CATEGORIES_DELETE]:
    "Permanently delete one of the user's categories. Requires confirmation. Fails if the category is still used by any transactions or budgets.",

  [AgentToolName.GOALS_LIST]:
    "List the user's savings goals with progress percentage and deadlines.",

  [AgentToolName.GOALS_GET]: "Get details for a single financial goal by ID or name.",

  [AgentToolName.GOALS_CREATE]:
    "Create a savings goal for the user. Requires confirmation. Fields: name, targetAmount, optional currentAmount already saved (defaults 0), optional deadline (date string), optional type (EMERGENCY_FUND | OBLIGATION | LIFESTYLE | PERSONAL).",

  [AgentToolName.GOALS_UPDATE]:
    "Update a goal's name, target amount, saved amount, deadline or type. Requires confirmation. Only pass the fields that should change.",

  [AgentToolName.GOALS_CONTRIBUTE]:
    "Add money to a goal's saved amount (capped at the target). Requires confirmation. This is a bookkeeping update on the goal only — it does not move money between accounts.",

  [AgentToolName.GOALS_DELETE]:
    "Permanently delete one of the user's savings goals. Requires confirmation — this is destructive and cannot be undone.",

  [AgentToolName.ANALYTICS_DASHBOARD]:
    "Get the user's current financial KPIs: net worth, monthly income/expenses, net cash flow, savings rate, and last-month comparison.",

  [AgentToolName.ANALYTICS_HEALTH_SCORE]:
    "Get the user's financial health score (0-100) with component breakdowns: free cash, savings rate, emergency runway, debt pressure, budget control, and goal progress.",

  [AgentToolName.ANALYTICS_MONTHLY_CASH_FLOW]:
    "Get monthly income/expense totals over the last N months for trend analysis.",

  [AgentToolName.ANALYTICS_RECOMMENDATIONS]:
    "Get deterministic, prioritized financial recommendations (budget overruns, savings rate, emergency fund, goal deadlines) computed from the user's live data.",

  [AgentToolName.ANALYTICS_OVERVIEW]:
    "Get an executive summary of income, expenses, net savings, and savings rate for the selected month or date range.",

  [AgentToolName.ANALYTICS_MONTHLY]:
    "Get monthly income vs. expense breakdown for the past 6 to 12 months.",

  [AgentToolName.ANALYTICS_CATEGORIES]:
    "Get spending breakdown grouped by categories for a month or date range.",

  [AgentToolName.ANALYTICS_SAVINGS_TREND]:
    "Get savings rate and net wealth accumulation trend analysis across months.",

  [AgentToolName.INSIGHTS_SAFE_TO_SPEND]:
    "Estimate how much the user can safely spend for the rest of the current month without jeopardizing budgets or goals. Based on liquid balance + month-to-date net cash flow − remaining budget commitments − goal installments.",

  [AgentToolName.INSIGHTS_HEALTH_SCORE]:
    "Calculate the holistic FinAI financial health score (0-100) based on liquidity, debt, savings, and budget discipline.",

  [AgentToolName.INVESTMENTS_LIST]:
    "Get the user's investment portfolio with total portfolio value and per-asset allocation percentages.",

  [AgentToolName.INVESTMENTS_CREATE]:
    "Add an investment holding to the user's portfolio. Requires confirmation. Fields: name, assetClass (MUTUAL_FUND | STOCK | FIXED_DEPOSIT | GOLD | EPF | PPF | REAL_ESTATE | CRYPTO | OTHER), currentValue, investedAmount.",

  [AgentToolName.INVESTMENTS_UPDATE_VALUE]:
    "Update the current market value of one of the user's investment holdings. Requires confirmation.",

  [AgentToolName.INVESTMENTS_DELETE]:
    "Permanently remove an investment holding from the user's portfolio. Requires confirmation — this is destructive and cannot be undone.",

  [AgentToolName.PROFILE_GET]:
    "Get the current user's profile: id, email, name, avatar URL, and preferences (appearance, notifications, security, default account).",

  [AgentToolName.PROFILE_UPDATE]:
    "Update the user's own profile: display name, email, or preference sections (appearance, notifications, security). Requires confirmation. Only pass the fields that should change.",

  [AgentToolName.PROFILE_SET_DEFAULT_ACCOUNT]:
    "Set which of the user's FinAI accounts is the default account. Requires confirmation. Resolve the account ID with accounts.list first.",

  [AgentToolName.SEARCH_ALL]:
    "Universal search across transactions, accounts, budgets, goals, and categories matching query keywords.",

  [AgentToolName.SEARCH_EVERYTHING]:
    "Search the user's transactions (by notes, category, or account name), accounts, and goals for a text query. Use this to resolve vague references like 'my HDFC account' or 'the electricity bill'.",

  [AgentToolName.ACTION_PATCH]:
    "Apply a correction to the pending (unconfirmed) action. Use when the user wants to change a field (amount, date, account, category, etc.) of the action currently awaiting confirmation. Only include the fields that should change — all other fields are preserved. The action remains pending after patching; it is NOT executed. Returns an updated confirmation card. If the reference is ambiguous (e.g. 'use SBI' but the user has two SBI accounts), ask for clarification instead of patching.",

  [AgentToolName.ACTION_CONFIRM]:
    "Confirm and execute the pending (unconfirmed) action. Use when the user explicitly confirms ('confirm', 'yes', 'go ahead', 'looks good') the action currently awaiting confirmation. This executes the action and returns the result.",
};

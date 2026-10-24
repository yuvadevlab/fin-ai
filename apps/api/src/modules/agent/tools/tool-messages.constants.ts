/**
 * @file apps/api/src/modules/agent/tools/tool-messages.constants.ts
 * @description Standardized summary messages and templates for FinAI agent tools.
 * @module @finai/api/agent/tools/messages
 */

export const TOOL_MESSAGES = {
  ACCOUNTS: {
    LISTED: (count: number) => `Retrieved ${count} account(s)`,
    CREATED: (name: string, type: string) => `Created account "${name}" [${type}]`,
    SET_DEFAULT: (name: string) => `Set account "${name}" as your default account`,
  },
  ANALYTICS: {
    DASHBOARD: "Retrieved dashboard financial statistics",
    MONTHLY: "Retrieved monthly cash flow analytics",
    BREAKDOWN: "Retrieved category spending breakdown",
    SAFE_TO_SPEND: "Generated safe-to-spend insight",
  },
  SEARCH: {
    RESULTS: (count: number, query: string) => `Found ${count} item(s) matching "${query}"`,
  },
  CATEGORIES: {
    LISTED: (count: number) => `Retrieved ${count} category/categories`,
    CREATED: (name: string) => `Created category "${name}"`,
    RESOLVED: (name: string) => `Matched category "${name}"`,
  },
  BUDGETS: {
    LISTED: (total: number, over: number) =>
      `Retrieved ${total} budget(s)${over > 0 ? ` — ${over} over limit` : ""}`,
    CREATED: (category: string) => `Created budget for ${category}`,
    UPDATED: (id: string) => `Updated budget ${id}`,
    DELETED: (id: string) => `Deleted budget ${id}`,
    TRANSFERRED: (amountFormatted: string, from: string, to: string) =>
      `Transferred ${amountFormatted} from ${from} to ${to}`,
  },
  GOALS: {
    LISTED: (count: number) => `Retrieved ${count} savings goal(s)`,
    CREATED: (name: string) => `Created goal "${name}"`,
    UPDATED: (name: string) => `Updated goal "${name}"`,
    DELETED: (id: string) => `Deleted goal ${id}`,
  },
  INVESTMENTS: {
    LISTED: (count: number) => `Retrieved ${count} investment asset(s)`,
    CREATED: (name: string) => `Created investment holding "${name}"`,
    UPDATED: (name: string) => `Updated investment holding "${name}"`,
    DELETED: (id: string) => `Deleted investment holding ${id}`,
  },
  PROFILE: {
    READ: (name: string, email: string) => `Profile for ${name} (${email})`,
    UPDATED: (name: string) => `Profile updated for ${name}`,
    DEFAULT_ACCOUNT_UPDATED: "Default account updated",
  },
  TRANSACTIONS: {
    LISTED: (count: number) => `Retrieved ${count} transaction(s)`,
    SUMMARIZED: "Summarized transactions",
    CREATED: (note: string, amountFormatted: string) =>
      `Recorded transaction "${note}" (${amountFormatted})`,
    BULK_CREATED: (count: number) => `Recorded ${count} transaction(s)`,
    UPDATED: (id: string) => `Updated transaction ${id}`,
    DELETED: (id?: string) => (id ? `Deleted transaction ${id}` : "Transaction deleted"),
    RECATEGORIZE_PREVIEW: (count: number, from?: string, to?: string) =>
      from && to
        ? `Dry-run preview: ${count} transaction(s) will be moved from ${from} to ${to}`
        : `Would re-categorize ${count} transaction(s) (dry-run)`,
    RECATEGORIZE_APPLY: (count: number, to?: string) =>
      to
        ? `Re-categorized ${count} transaction(s) to ${to}`
        : `Re-categorized ${count} transaction(s)`,
  },
  ACTIONS: {
    PATCHED: (id: string) => `Patched action ${id}`,
    CONFIRMED: (id: string) => `Confirmed and executed action ${id}`,
  },
} as const;

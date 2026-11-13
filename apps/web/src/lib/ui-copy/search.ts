export const SEARCH_COPY = {
  RESULTS_LABEL: "Search results",
  NO_RESULTS: (query: string): string => `No results for “${query}”`,
  TRANSACTIONS: "Transactions",
  ACCOUNTS: "Accounts",
  GOALS: "Savings Goals",
  PLACEHOLDER: "Search transactions, categories…",
  OPEN_SEARCH: "Search",
  CLOSE_SEARCH: "Close search",
  CLEAR_SEARCH: "Clear search query",
} as const;

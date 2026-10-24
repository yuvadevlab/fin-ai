export const SEARCH_COPY = {
  RESULTS_LABEL: "Search results",
  NO_RESULTS: (query: string): string => `No results for “${query}”`,
  TRANSACTIONS: "Transactions",
  ACCOUNTS: "Accounts",
  GOALS: "Savings Goals",
} as const;

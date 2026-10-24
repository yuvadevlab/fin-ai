export const ACCOUNTS_COPY = {
  PAGE_TITLE: "Accounts",
  REMOVE_TITLE: "Remove Account",
  TYPES: {
    BANK: "Bank Account",
    CREDIT_CARD: "Credit Card",
    DIGITAL_WALLET: "Digital Wallet",
    CASH_WALLET: "Cash Wallet",
  },
  LINK_ACCOUNT: "Link Account",
  EMPTY_TITLE: "No accounts linked yet",
  EMPTY_DESCRIPTION:
    "Link your bank accounts, credit cards, or digital wallets to track your net worth and cash flow.",
  LINK_FIRST: "Link First Account",
  ACTIVE_STATUS: "Status: Active",
  LINKED: "Accounts linked",
  LINKED_ACCOUNTS: "Linked Accounts",
  PAGE_DESCRIPTION:
    "Consolidated net position across all your linked bank accounts, cards, and wallets.",
  BALANCE_DESCRIPTION: (count: number, balance: string): string =>
    `Consolidated net position across ${count} accounts: ${balance}.`,
  DEFAULT_BADGE: "Default",
  REMOVE_CONFIRMATION: (name: string): string =>
    `Are you sure you want to remove "${name}"? This will hide the account from your dashboard while keeping your transaction history intact.`,
  REMOVE_BUTTON: "Remove",
  FORM: {
    NAME: "Account Name",
    NAME_PLACEHOLDER: "e.g. HDFC Salary, SBI Savings",
    TYPE: "Account Type",
    INITIAL_BALANCE: "Initial Balance",
    BALANCE_PLACEHOLDER: "0.00",
    CURRENCY: "Currency",
    CURRENCY_PLACEHOLDER: "INR",
    EDIT_RESTRICTIONS:
      "Account type, currency, and balance cannot be changed directly. Use transactions to adjust the balance.",
    DEFAULT_ACCOUNT: "Default account",
    SET_DEFAULT: "Set as default account",
    AUTO_SELECTED: "Auto-selected when logging new transactions",
    EDIT_TITLE: "Edit Account",
    CREATE_TITLE: "Link Account",
    EDIT_DESCRIPTION: "Update the account name. Balance is adjusted via transactions.",
    CREATE_DESCRIPTION: "Link a new bank account, credit card, or wallet.",
    UPDATE_FAILED: "Failed to update account.",
    LINK_FAILED: "An error occurred while linking the account.",
  },
  SET_DEFAULT_ACTION: "Set as Default",
  EDIT_ACTION: "Edit Account",
  DELETE_ACTION: "Delete Account",
} as const;

/**
 * @file packages/ui/src/constants/ui-copy.constants.ts
 * @description Canonical UI copy constants for reusable @fin-ai/ui components.
 * Adheres to Rule 5 (Package-level constants in dedicated files) and Rule 6 (Zero hardcoded strings).
 * @module @fin-ai/ui/constants
 */

export const UI_COPY_CONSTANTS = {
  PAGINATION: {
    NAV_ARIA: "Pagination",
    PAGE: "Page",
    OF: "of",
    ITEMS: "items",
    PER_PAGE: "Per page:",
    ROWS_PER_PAGE_ARIA: "Rows per page",
    PREV: "Prev",
    PREV_ARIA: "Go to previous page",
    NEXT: "Next",
    NEXT_ARIA: "Go to next page",
  },
  MASKED_VALUE: {
    HIDDEN_ARIA: "Value hidden for privacy",
  },
  MONEY_DISPLAY: {
    HIDDEN_ARIA: "Amount hidden for privacy",
  },
  BRAND: {
    NAME: "FinAI",
  },
  TOPBAR: {
    CLEAR_SEARCH_ARIA: "Clear search query",
    OPEN_MENU_ARIA: "Open navigation menu",
    EXPAND_SIDEBAR_ARIA: "Expand sidebar (Cmd+B)",
    COLLAPSE_SIDEBAR_ARIA: "Collapse sidebar (Cmd+B)",
    SEARCH_ARIA: "Search",
    NOTIFICATIONS_ARIA: "Notifications",
    NOTIFICATIONS_UNREAD_ARIA: "Notifications, unread items available",
    SEARCH_PLACEHOLDER: "Search anything...",
    USER_PROFILE_ARIA: "User profile",
    THEME_TOGGLE_ARIA: "Toggle color theme",
  },
  SIDEBAR: {
    NAV_ARIA: "Sidebar navigation",
    MAIN_NAV_ARIA: "Main Navigation",
    BRAND_HOME_ARIA: "FinAI Home",
    OVERVIEW_HEADING: "Overview",
    INTELLIGENCE_HEADING: "Intelligence",
    COLLAPSE_ARIA: "Collapse sidebar (Cmd+B)",
    EXPAND_ARIA: "Expand sidebar (Cmd+B)",
    COLLAPSE_TEXT: "Collapse Sidebar",
  },
  SIDEBAR_AI_CARD: {
    READY_ARIA: "AI Advisor: Ready",
    TOOLTIP_TITLE: "AI Advisor — Ready",
    CLICK_TO_OPEN: "Click to open advisor",
    TITLE: "AI Advisor",
    BADGE_READY: "Ready",
    DESCRIPTION: "Get personalized insights & wealth optimization.",
    ACTION_TEXT: "Ask question",
  },
  APP_SHELL: {
    MAIN_ARIA: "Main content",
  },
  FORM_DIALOG: {
    SAVING: "Saving...",
    SAVE: "Save",
    CANCEL: "Cancel",
    SELECT_OPTION_PLACEHOLDER: "Select an option",
    SEARCH_PLACEHOLDER: (label: string): string => `Search ${label.toLowerCase()}...`,
    ADD_NEW_LABEL: (label: string): string => `Add new ${label.toLowerCase()}`,
    PICK_DATE_PLACEHOLDER: "Pick a date",
  },
  PROGRESS_CARD: {
    OF: "of",
  },
  SCORE_GAUGE: {
    DEFAULT_LABEL: "out of 100",
    SCORE_PREFIX: "Score:",
  },
  CONFIRMATION_CARD: {
    DEPENDENCY_NOTICE: "Confirm the previous action first — this action depends on it.",
    PENDING_NOTICE: "This action has NOT happened yet — confirm to execute.",
    CONFIRM_BTN: "Confirm",
    CANCEL_BTN: "Cancel",
    AWAITING_APPROVAL: "Awaiting your approval",
    CONFIRMED: "Confirmed & executed",
    REJECTED: "Rejected",
    FAILED: "Failed to execute",
  },
  AI_INSIGHT_CARD: {
    TITLE: "AI Insight",
    CTA: "Review details",
  },
  AI_SUGGESTIONS_DIALOG: {
    TITLE: "AI Suggestions",
    APPLY_SELECTED: "Apply selected",
    CANCEL: "Cancel",
    APPLIED: (count: number): string => `${count} suggestion${count > 1 ? "s" : ""} applied`,
  },
  SEARCH_BAR: {
    PLACEHOLDER: "Search...",
  },
  CHARTS: {
    INCOME: "Income",
    EXPENSE: "Expense",
    INVESTMENT: "Investment",
    EXPENSE_REDUCED: "Reduced (Positive)",
    EXPENSE_INCREASED: "Spike (Alert)",
    SAVINGS_GROWING: "Growing (Positive)",
    SAVINGS_DIPPED: "Dipped (Alert)",
    BASELINE: "Baseline",
    TOOLTIP: {
      SAVINGS_LABEL: "Savings",
      TOTAL_SPEND: "Total spend",
      EXPENSE_REDUCED: "Spending reduced",
      EXPENSE_INCREASED: "Higher spending",
      EXPENSE_STEADY: "Steady spending",
      SAVINGS_GROWING: "Savings growing",
      SAVINGS_DIPPED: "Savings dipped",
      SAVINGS_STEADY: "Steady savings",
      BASELINE_MONTH: "Baseline month",
    },
  },
} as const;

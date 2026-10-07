/**
 * @file apps/web/src/lib/ui-copy/advisor.ts
 * @description Centralized UI copy, placeholders, and a11y text for FinAI Autonomous Advisor.
 * @module @finai/web/lib/ui-copy/advisor
 */

export const ADVISOR_COPY = {
  HEADER: {
    TITLE: "AI Advisor",
    BADGE: "Autonomous Agent",
    HISTORY_BUTTON: "History",
    HISTORY_TOOLTIP: "View past conversations",
    CONTEXT_BUTTON: "Financial Context",
    CONTEXT_TOOLTIP: "Inspect portfolio snapshot and quick prompts",
    NEW_CHAT_BUTTON: "New Chat",
    GUIDE_BUTTON: "How it works",
  },
  DRAWER: {
    TITLE: "Past Conversations",
    DESCRIPTION: "Resume where you left off.",
    EMPTY: "No conversations yet.",
    UNTITLED_CHAT: "Untitled chat",
    DELETE_TOOLTIP: "Delete chat",
    DELETE_A11Y: "Delete conversation",
  },
  COMPOSER: {
    PLACEHOLDER: "Ask FinAI to analyze, plan, or take action…",
    PLACEHOLDER_EDITING: "Modify the pending action…",
    STOP_A11Y: "Stop generating",
    SEND_A11Y: "Send",
    STOP_ACTION: "stop",
    ENTER_HINT: "Enter to send · Shift+Enter for new line",
    CORRECTION_HINT: "Corrections never execute — only Confirm does.",
    PENDING_PREFIX: "Pending:",
    PENDING_SUFFIX: "— say a correction or confirm it above.",
  },
  FEED: {
    NEW_CONTENT: "New content",
    JUMP_TO_LATEST: "Jump to latest",
    FOLLOW_UPS_LABEL: "Suggested next steps:",
    SUGGESTED_FOLLOW_UPS: "Suggested follow-ups",
    EXECUTE_ACTION: "Executing proposed action...",
  },
  CONTEXT: {
    TITLE: "Financial Context",
    DESCRIPTION: "Live workspace snapshot and quick actions.",
    QUICK_ACTIONS_TITLE: "Quick actions",
    AGENT_STATUS_TITLE: "Agent",
    STREAMING_DEFAULT: "FinAI is thinking…",
    ACTION_TITLE: "Action",
    WAITING_APPROVAL: "Waiting for your approval",
    JUST_REVIEWED_TITLE: "Just reviewed",
    SNAPSHOT_TITLE: "Financial snapshot",
  },
  EMPTY_STATE: {
    TITLE: "AI Advisor",
    SUBTITLE:
      "What can I help you with? Analyze your finances, plan your money, or ask me to take an action.",
    OR_ASK_BELOW: "…or ask anything below.",
  },
  SKELETON: {
    STATUS_LABEL: "Loading conversation",
    SR_TEXT: "Loading conversation history...",
  },
  GUIDE: {
    TITLE: "How FinAI Advisor Works",
    DESCRIPTION:
      "Your intelligent assistant for logging transactions, tracking budgets, and getting personalized financial insights safely with two-phase confirmations.",
    EXAMPLES_LABEL: "Examples you can try:",
    PRO_TIP: "Pro tip:",
  },
  SNAPSHOT: {
    CASH_AVAILABLE: "Cash available",
    THIS_MONTH: "This month",
    INCOME: "Income",
    EXPENSES: "Expenses",
    NET_CASH_FLOW: "Net cash flow",
    NET_WORTH: "Net worth",
    CURRENT_CONTEXT: "Current context",
    ACCOUNTS: "Accounts",
    BUDGETS: "Budgets",
    GOALS: "Goals",
    DEFAULT_ACCOUNT: "Default account:",
    NONE_SET: "None set",
  },
} as const;

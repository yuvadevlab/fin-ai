/**
 * @file apps/web/src/lib/ui-copy/early-access.ts
 * @description Centralized UI copy for the FinAI Private Beta / Early Access modal and waitlist.
 * Adheres to Rule 4 (strictly under 250 lines) and Rule 6 (zero hardcoded user-facing strings).
 * @module @fin-ai/web/lib/ui-copy/early-access
 */

export const EARLY_ACCESS_COPY = {
  MODAL_TITLE: "Request Early Access",
  MODAL_SUBTITLE:
    "FinAI is currently in invitation-only Private Beta to maintain dedicated server performance. Apply below to join our next onboarding cohort.",
  BADGE: "Private Beta • Selective Onboarding",
  FIELD_NAME: "Full Name",
  FIELD_NAME_PLACEHOLDER: "Jane Doe",
  FIELD_EMAIL: "Email Address",
  FIELD_EMAIL_PLACEHOLDER: "jane@example.com",
  FIELD_GOAL: "Primary Financial Focus",
  FIELD_GOAL_OPTIONS: [
    { value: "EXPENSE_TRACKING", label: "Automated Expense Tracking" },
    { value: "BUDGET_PLANNING", label: "Adaptive Envelope Budgeting" },
    { value: "AI_ADVISOR", label: "Agentic AI Financial Co-Pilot" },
    { value: "WEALTH_MANAGEMENT", label: "Multi-Year Wealth Forecasting" },
    { value: "ALL", label: "Complete Financial Workspace" },
  ] as const,
  FIELD_NOTES: "What is your main financial goal or challenge? (Optional)",
  FIELD_NOTES_PLACEHOLDER: "e.g., Managing subscription creep, multi-currency accounts...",
  SUBMIT_BUTTON: "Submit Access Request",
  SUBMITTING: "Securing your spot…",
  SUCCESS_TITLE: "Application Received!",
  SUCCESS_SUBTITLE:
    "Thank you for applying. We review and onboard new user cohorts each week to ensure optimal server performance. Watch your inbox for your invitation link.",
  SUCCESS_CLOSE: "Close Window",
  ERROR_GENERIC: "Something went wrong submitting your request. Please try again.",
  ERROR_NAME_REQUIRED: "Please enter your name.",
  ERROR_EMAIL_INVALID: "Please enter a valid email address.",
  CAPACITY_NOTE: "Cohort capacity limited on current compute tier.",
} as const;

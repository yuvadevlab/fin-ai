import {
  Activity,
  BarChart3,
  CircleDollarSign,
  ListChecks,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface QuickAction {
  label: string;
  /** Optional short hint shown as a secondary line in action grids. */
  hint?: string;
  message: string;
  icon: LucideIcon;
}

/**
 * Quick-action data for common intents. Every message here maps to a real
 * agent capability (verified against the supported tool list):
 *
 * - "Spending"           → transactions.summarize / analytics.dashboard
 * - "Budget"             → budgets.list / analytics
 * - "Goals"              → goals.list
 * - "Cash flow"          → analytics.monthlyCashFlow
 * - "Add expense"        → transactions.create (write, confirmation-gated)
 * - "Financial health"   → analytics.healthScore
 */
export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Spending",
    hint: "Top categories & trends",
    message: "Analyze my spending this month and highlight the top categories.",
    icon: BarChart3,
  },
  {
    label: "Budget",
    hint: "Which budgets are at risk",
    message: "Check my budgets and tell me which ones are at risk.",
    icon: ListChecks,
  },
  {
    label: "Goals",
    hint: "Are you on track?",
    message: "Review my savings goals and whether I am on track.",
    icon: PiggyBank,
  },
  {
    label: "Cash flow",
    hint: "Income vs expenses",
    message: "How is my monthly cash flow this month?",
    icon: Activity,
  },
  {
    label: "Add expense",
    hint: "Record a transaction",
    message: "I want to record a new expense.",
    icon: Wallet,
  },
  {
    label: "Financial health",
    hint: "Overall score",
    message: "How is my overall financial health?",
    icon: CircleDollarSign,
  },
];

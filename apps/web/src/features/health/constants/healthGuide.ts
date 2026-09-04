export interface HealthGuideItem {
  label: string;
  target: string;
  explanation: string;
  counts: string;
  improvement: string;
}

export const HEALTH_GUIDE: HealthGuideItem[] = [
  {
    label: "Monthly free cash",
    target: "Aim to keep at least 20% of monthly income",
    explanation:
      "This is your income minus your recorded expenses for the month. For example, if you earn INR 50,000 and spend INR 35,000, your free cash is INR 15,000.",
    counts: "Income and expense transactions recorded this month.",
    improvement:
      "Keep this amount positive. Reduce one recurring expense or move part of the balance to savings after payday.",
  },
  {
    label: "Savings rate",
    target: "Save around 20% of monthly income",
    explanation:
      "This is the percentage of income left after expenses. If you earn INR 50,000 and have INR 10,000 left, your savings rate is 20%.",
    counts:
      "Income and expense transactions. A transfer is useful only when it is reflected as money not spent.",
    improvement:
      "Automate a small amount after payday and increase it gradually. Savings can go toward an emergency fund, a goal, or investments.",
  },
  {
    label: "Emergency runway",
    target: "Build toward 6 months of expenses",
    explanation: "This estimates how long your emergency savings can support essential spending.",
    counts:
      "Your emergency-fund goal balance divided by one month of recorded expenses. INR 90,000 saved with INR 30,000 monthly expenses equals 3 months of runway.",
    improvement: "Start with one month of essential expenses before investing more aggressively.",
  },
  {
    label: "Debt pressure",
    target: "Keep tracked debt below 30% of monthly income",
    explanation:
      "This compares negative account balances, such as credit-card debt, with your monthly income. If debt is INR 20,000 and income is INR 50,000, pressure is 40%.",
    counts:
      "Negative balances on active accounts. Loans or EMIs are included only if they are represented by a negative account balance.",
    improvement: "Pay down high-interest debt first and avoid adding new monthly repayments.",
  },
  {
    label: "Budget control",
    target: "Keep at least 90% of budgets within limit",
    explanation:
      "This is the percentage of your budgets where spending is at or below the limit. If 9 of 10 budgets are within their limits, your budget control is 90%.",
    counts:
      "Budgets configured for categories and expense transactions recorded against those categories this month.",
    improvement:
      "Create budgets for your largest categories and review them before spending accelerates.",
  },
  {
    label: "Goal progress",
    target: "Fund at least 70% of planned goals",
    explanation:
      "This is the average amount saved toward your non-emergency goals. A goal with INR 30,000 saved toward a INR 60,000 target is 50% funded.",
    counts:
      "The current amount and target amount of your personal, lifestyle, or obligation goals. Emergency funds are measured separately.",
    improvement: "Choose one priority goal and give it a consistent monthly contribution.",
  },
];

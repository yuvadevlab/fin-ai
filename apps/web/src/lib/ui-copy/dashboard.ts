export const DASHBOARD_COPY = {
  DATE_RANGE: {
    CUSTOM: "Custom Range",
    FROM: "From",
    TO: "To",
    APPLY_CUSTOM_RANGE: "Apply Custom Range",
    SELECT_DATE_RANGE: "Select Date Range",
  },
  PAGE: {
    TITLE: "Financial Overview",
    DESCRIPTION: "Your aggregated wealth across personal accounts, investments, and goals.",
    ADD_TRANSACTION: "Add Transaction",
    MONTHLY_CASH_FLOW: "Monthly Cash Flow",
    EXPENSE_TREND: "Expense Trend",
    EXPENSE_TREND_HINT: "Monthly total",
    SAVINGS_TREND: "Savings Trend",
    SAVINGS_TREND_HINT: "Amount saved / month",
    LEARN_EXPENSE: "Learn how expense trend is calculated",
    LEARN_SAVINGS: "Learn how savings trend is calculated",
    LEARN_CALCULATION: "How this is calculated",
  },
  CASH_FLOW: {
    RANGE_LABEL: "Select cash flow time period",
    PERIOD_PLACEHOLDER: "Period",
    RANGES: {
      THREE_MONTHS: "Last 3 months",
      SIX_MONTHS: "Last 6 months",
      TWELVE_MONTHS: "Last 12 months",
      TWO_YEARS: "Last 2 years",
      ALL_TIME: "All time",
    },
  },
  PORTFOLIO: {
    TITLE: "Invested Portfolio",
    ACTIVE_HOLDINGS: (count: number): string => `${count} active holdings`,
    INVESTED_PREFIX: "Invested:",
    HOLDINGS: "holdings",
    VIEW_ALL: "View all",
    TOTAL_RETURNS: "Total Returns",
  },
  BUDGET: {
    TITLE: "Budget Guardrail",
    CAP_UTILIZED: (percentage: number): string => `${percentage}% cap utilized`,
    MANAGE: "Manage",
    OF: "of",
    STATUS: "Status",
  },
  GOALS: {
    TITLE: "Savings Goals",
    TARGETS_TRACKING: (count: number): string => `${count} targets tracking`,
    VIEW_GOALS: "View goals",
    FUNDED: "funded",
    TARGET_TOTAL: "Target Total",
  },
  CATEGORY_CARD: {
    EMPTY_TITLE: "No expenses logged this month",
    EMPTY_DESCRIPTION: "Add transactions to see category distribution",
  },
  HEALTH_CARD: {
    TITLE: "Financial Health",
    VIEW_ALL: "View all",
    DESCRIPTION: "Based on your cash flow, safety net, debt & goals",
  },
  CATEGORY_ALLOCATION: "Category Allocation",
  KPI: {
    NET_WORTH: "Net Worth",
    NET_WORTH_HINT: "Accounts + Investments",
    MONTHLY_INCOME: "Monthly Income",
    MONTHLY_EXPENSES: "Monthly Expenses",
    SAVINGS_RATE: "Savings Rate",
    LAST_MONTH: "vs last month",
    NET: (amount: string): string => `Net: ${amount}`,
  },
  TREND_GUIDE: {
    EXPENSE: {
      TITLE: "How Expense Trend is calculated",
      DESCRIPTION:
        "Understand how your monthly spending is aggregated and what counts toward your living expenses.",
      CATEGORIZED_EXPENSES: "Categorized Monthly Expenses",
      OUTFLOW_TRACKING: "Outflow Tracking",
      EXPENSE_EXPLANATION:
        "Sums all debits categorized as EXPENSE occurring within each calendar month based on transaction dates.",
      EXPENSE_COUNTS:
        "Living costs, rent, utilities, food, groceries, shopping, EMI payments, and healthcare.",
      EXPENSE_NOTE:
        "Amounts are normalized using absolute values so negative debits and positive charges are aggregated accurately without double-counting.",
      EXCLUDED_EXPENSES: "Excluded from Expenses",
      TRANSFERS_INVESTMENTS: "Transfers & Investments",
      EXCLUDED_EXPLANATION:
        "Internal movements between your own accounts and allocations into wealth assets do not count as expenses.",
      EXCLUDED_COUNTS:
        "Account-to-account transfers, credit card settlements, mutual funds, stocks, fixed deposits, and gold investments.",
      EXCLUDED_NOTE:
        "This protects your cost-of-living metrics from being artificially inflated by wealth-building and fund transfers.",
      FOOTER:
        "Expense metrics represent pure consumption and obligations, giving you an accurate picture of your true monthly burn rate.",
    },
    SAVINGS: {
      TITLE: "How Savings Trend is calculated",
      DESCRIPTION:
        "Understand how your monthly net savings are computed from cash flow inflows and outflows.",
      NET_SAVINGS: "Net Savings Formula",
      INCOME_EXPENSES: "Income − Expenses",
      NET_EXPLANATION:
        "Calculated per calendar month by subtracting total monthly living expenses from total verified income.",
      NET_COUNTS:
        "Salary, business revenue, freelance payouts, dividends, minus all categorized monthly expenses.",
      NET_NOTE:
        "Values are clamped at zero (Math.max(0, net)) for trend visualization so drawdown months do not display misleading negative bars.",
      RETAINED_SURPLUS: "Retained Surplus",
      LIQUID_ACCUMULATION: "Liquid Accumulation",
      SURPLUS_EXPLANATION:
        "The unspent surplus retained in your accounts each month after meeting living requirements.",
      SURPLUS_COUNTS:
        "Money available for emergency fund reserves, discretionary cushions, or deployment into long-term investments.",
      SURPLUS_NOTE:
        "Consistent positive savings indicate a healthy savings rate and provide the fuel for portfolio compounding.",
      FOOTER:
        "A healthy savings trend sustains emergency buffers and powers ongoing goal contributions across market cycles.",
    },
  },
} as const;

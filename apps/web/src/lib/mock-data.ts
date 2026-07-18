export const monthlyCashFlow = [
  { month: "Oct", income: 118000, expense: 44000 },
  { month: "Nov", income: 121000, expense: 52000 },
  { month: "Dec", income: 125000, expense: 61000 },
  { month: "Jan", income: 125000, expense: 47000 },
  { month: "Feb", income: 130000, expense: 49000 },
  { month: "Mar", income: 125000, expense: 48200 },
];

export const categoryBreakdown = [
  { name: "Housing", value: 22000 },
  { name: "Groceries", value: 12400 },
  { name: "Lifestyle", value: 8200 },
  { name: "Transport", value: 3400 },
  { name: "Utilities", value: 2200 },
];

export const savingsTrend = [
  { month: "Oct", value: 74000 },
  { month: "Nov", value: 69000 },
  { month: "Dec", value: 64000 },
  { month: "Jan", value: 78000 },
  { month: "Feb", value: 81000 },
  { month: "Mar", value: 76800 },
];

export const transactions = [
  {
    id: "t1",
    date: "2026-03-08",
    category: "Food & Dining",
    account: "HDFC Credit",
    amount: -840,
    workspace: "Personal",
  },
  {
    id: "t2",
    date: "2026-03-07",
    category: "Income",
    account: "HDFC Salary",
    amount: 125000,
    workspace: "Personal",
  },
  {
    id: "t3",
    date: "2026-03-06",
    category: "Groceries",
    account: "Joint Account",
    amount: -3240,
    workspace: "Family",
  },
  {
    id: "t4",
    date: "2026-03-05",
    category: "Transport",
    account: "Paytm Wallet",
    amount: -420,
    workspace: "Personal",
  },
  {
    id: "t5",
    date: "2026-03-04",
    category: "Utilities",
    account: "Joint Account",
    amount: -1180,
    workspace: "Family",
  },
  {
    id: "t6",
    date: "2026-03-03",
    category: "Shopping",
    account: "HDFC Credit",
    amount: -2450,
    workspace: "Personal",
  },
  {
    id: "t7",
    date: "2026-03-02",
    category: "Investment",
    account: "ICICI Savings",
    amount: -15000,
    workspace: "Personal",
  },
  {
    id: "t8",
    date: "2026-03-01",
    category: "Housing",
    account: "Joint Account",
    amount: -32000,
    workspace: "Family",
  },
];

export const accounts = [
  {
    name: "HDFC Salary",
    type: "Bank Account",
    balance: 214500,
    change: "+₹1,25,000",
    recent: "Salary credited",
  },
  {
    name: "ICICI Savings",
    type: "Bank Account",
    balance: 342800,
    change: "-₹15,000",
    recent: "SIP debited",
  },
  {
    name: "Joint Account",
    type: "Family Shared",
    balance: 128200,
    change: "-₹36,420",
    recent: "Rent + groceries",
  },
  {
    name: "HDFC Credit",
    type: "Credit Card",
    balance: -18240,
    change: "-₹3,290",
    recent: "Amazon purchase",
  },
  {
    name: "Paytm Wallet",
    type: "Wallet",
    balance: 4200,
    change: "-₹420",
    recent: "Uber ride",
  },
  {
    name: "Cash",
    type: "Cash",
    balance: 6500,
    change: "-₹1,200",
    recent: "Auto rickshaw",
  },
];

export const budgets = [
  { name: "Food & Dining", spent: 8400, limit: 10000 },
  { name: "Groceries", spent: 12400, limit: 15000 },
  { name: "Transport", spent: 3400, limit: 5000 },
  { name: "Entertainment", spent: 6800, limit: 6000 },
  { name: "Shopping", spent: 4200, limit: 8000 },
  { name: "Utilities", spent: 2200, limit: 3500 },
];

export const goals = [
  {
    name: "Emergency Fund",
    target: 500000,
    current: 380000,
    deadline: "Dec 2026",
    type: "Personal",
  },
  {
    name: "Europe Vacation",
    target: 400000,
    current: 180000,
    deadline: "Jul 2026",
    type: "Family",
  },
  {
    name: "House Down Payment",
    target: 5000000,
    current: 1250000,
    deadline: "Dec 2028",
    type: "Family",
  },
  {
    name: "New MacBook Pro",
    target: 250000,
    current: 95000,
    deadline: "Sep 2026",
    type: "Personal",
  },
  {
    name: "Gold Savings",
    target: 200000,
    current: 145000,
    deadline: "Dec 2026",
    type: "Personal",
  },
];

export const investments = [
  { name: "Mutual Funds", value: 425000, change: 12.4, allocation: 38 },
  { name: "Stocks", value: 285000, change: 8.2, allocation: 25 },
  { name: "Fixed Deposits", value: 180000, change: 6.5, allocation: 16 },
  { name: "Gold", value: 145000, change: 4.8, allocation: 13 },
  { name: "EPF", value: 62000, change: 8.1, allocation: 5 },
  { name: "PPF", value: 38000, change: 7.1, allocation: 3 },
];

export const healthMetrics = [
  { label: "Spending Control", score: 82, note: "Below monthly cap" },
  { label: "Savings Rate", score: 88, note: "48% of income saved" },
  { label: "Investments", score: 74, note: "Diversified across 6 assets" },
  { label: "Emergency Fund", score: 76, note: "6.2 months covered" },
  { label: "Budget Discipline", score: 68, note: "Entertainment over budget" },
];

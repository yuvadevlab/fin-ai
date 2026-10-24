/**
 * @file apps/api/src/modules/ai/context-formatters.ts
 * @description Formats financial data snapshots into structured text context for the LLM.
 * @module @finai/api/ai/context-formatters
 */

import { formatINR } from "@finai/finance-engine";

export interface FinanceContextData {
  todayStr: string;
  netWorth: number;
  monthIncome: number;
  monthExpenses: number;
  monthSavings: number;
  savingsRate: number;
  portfolioValue: number;
  totalInvested: number;
  unrealizedGain: number;
  portfolioReturnPct: number;
  accounts: { name: string; type: string; balance: number }[];
  topCategories: [string, number][];
  categories: { name: string }[];
  budgets: { limit: number; category?: { name: string } | null }[];
  monthCategorySpend: Record<string, number>;
  goals: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string | Date | null;
  }[];
  investments: {
    name: string;
    assetClass: string;
    currentValue: number;
    investedAmount: number;
  }[];
  recentTxns: {
    date: Date;
    type: string;
    amount: number;
    notes?: string | null;
    category?: { name: string } | null;
  }[];
}

export function formatFinanceContextMarkdown(data: FinanceContextData): string {
  const {
    todayStr,
    netWorth,
    monthIncome,
    monthExpenses,
    monthSavings,
    savingsRate,
    portfolioValue,
    totalInvested,
    unrealizedGain,
    portfolioReturnPct,
    accounts,
    topCategories,
    categories,
    budgets,
    monthCategorySpend,
    goals,
    investments,
    recentTxns,
  } = data;

  const lines = [
    `FINANCIAL SNAPSHOT (Real-time data as of today, ${todayStr}):`,
    `============================================================`,
    `### Key KPIs`,
    `- Net Worth: ${formatINR(netWorth)}`,
    `- This Month Income: ${formatINR(monthIncome)}`,
    `- This Month Expenses: ${formatINR(monthExpenses)}`,
    `- Net Savings This Month: ${formatINR(monthSavings)} (Savings Rate: ${savingsRate}%)`,
    `- Investment Holdings Value: ${formatINR(portfolioValue)} (Cost: ${formatINR(totalInvested)} | P&L: ${unrealizedGain >= 0 ? "+" : ""}${formatINR(unrealizedGain)} / ${portfolioReturnPct}%)`,
    ``,
    `### Accounts (${accounts.length} linked)`,
    accounts.length === 0
      ? `- No bank accounts linked yet.`
      : accounts.map((a) => `- ${a.name} [${a.type}]: ${formatINR(a.balance)}`).join("\n"),
    ``,
    `### Top Expense Categories (This Month)`,
    topCategories.length === 0
      ? `- No expenses recorded this month.`
      : topCategories.map(([cat, amt]) => `- ${cat}: ${formatINR(amt)}`).join("\n"),
    ``,
    `### Available Categories (${categories.length})`,
    categories.length === 0
      ? `- No categories created.`
      : `- ${categories.map((c) => c.name).join(", ")}`,
    ``,
    `### Active Budgets & Adherence (${budgets.length})`,
    budgets.length === 0
      ? `- No budgets defined yet.`
      : budgets
          .map((b) => {
            const catName = b.category?.name ?? "Category";
            const spent = monthCategorySpend[catName] ?? 0;
            const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
            const status =
              pct > 100
                ? "EXCEEDED"
                : pct === 100
                  ? "LIMIT_REACHED"
                  : pct >= 85
                    ? "AT_RISK"
                    : "ON_TRACK";
            return `- ${catName}: Limit ${formatINR(b.limit)} | Spent ${formatINR(spent)} (${pct}%) [${status}]`;
          })
          .join("\n"),
    ``,
    `### Savings Goals (${goals.length})`,
    goals.length === 0
      ? `- No goals created yet.`
      : goals
          .map((g) => {
            const pct =
              g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
            const deadlineStr = g.deadline
              ? new Date(g.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No deadline";
            return `- ${g.name}: ${formatINR(g.currentAmount)} / ${formatINR(g.targetAmount)} (${pct}%) — Target: ${deadlineStr}`;
          })
          .join("\n"),
    ``,
    `### Investments Portfolio (${investments.length})`,
    investments.length === 0
      ? `- No investments tracked yet.`
      : investments
          .map((inv) => {
            const gain = inv.currentValue - inv.investedAmount;
            const ret = inv.investedAmount > 0 ? Math.round((gain / inv.investedAmount) * 100) : 0;
            return `- ${inv.name} (${inv.assetClass}): Value ${formatINR(inv.currentValue)} (Invested: ${formatINR(inv.investedAmount)} | Return: ${gain >= 0 ? "+" : ""}${formatINR(gain)} / ${ret}%)`;
          })
          .join("\n"),
    ``,
    `### Granular Recent Transactions (Latest ${recentTxns.length})`,
    recentTxns.length === 0
      ? `- No recent transactions.`
      : recentTxns
          .slice(0, 30)
          .map(
            (t) =>
              `- ${new Date(t.date).toISOString().slice(0, 10)} | [${t.type}] | ${t.category?.name ?? "General"} | ${formatINR(t.amount)}${t.notes ? ` ("${t.notes}")` : ""}`,
          )
          .join("\n"),
  ];

  return lines.join("\n");
}

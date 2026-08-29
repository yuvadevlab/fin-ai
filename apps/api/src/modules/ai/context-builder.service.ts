import { Injectable } from "@nestjs/common";
import { formatINR } from "@finai/finance-engine";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class ContextBuilderService {
  constructor(private prisma: PrismaService) {}

  async buildFinanceContext(userId: string): Promise<string> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [accounts, monthTxns, recentTxns, budgets, goals, investments] = await Promise.all([
      this.prisma.client.account.findMany({
        where: { userId, isActive: true },
        select: { name: true, type: true, balance: true, currency: true },
      }),
      // Transactions this calendar month for accurate monthly totals
      this.prisma.client.transaction.findMany({
        where: { userId, date: { gte: startOfMonth } },
        include: { category: { select: { name: true, group: true } } },
      }),
      // Last 40 recent transactions for granular context
      this.prisma.client.transaction.findMany({
        where: { userId },
        include: { category: { select: { name: true, group: true } } },
        orderBy: { date: "desc" },
        take: 40,
      }),
      this.prisma.client.budget.findMany({
        where: { userId },
        include: { category: { select: { name: true } } },
      }),
      this.prisma.client.goal.findMany({ where: { userId } }),
      this.prisma.client.investment.findMany({ where: { userId } }),
    ]);

    const totalBankBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0);
    const totalInvestedPrincipal = investments.reduce((sum, i) => sum + i.investedAmount, 0);
    const investmentGainLoss = totalInvestments - totalInvestedPrincipal;
    const netWorth = totalBankBalance + totalInvestments;

    // Monthly Cash Flow
    let monthIncome = 0;
    let monthExpenses = 0;
    const monthCategorySpend: Record<string, number> = {};

    monthTxns.forEach((t) => {
      if (t.type === "INCOME") {
        monthIncome += t.amount;
      } else if (t.type === "EXPENSE") {
        monthExpenses += t.amount;
        const cat = t.category?.name ?? "Uncategorized";
        monthCategorySpend[cat] = (monthCategorySpend[cat] ?? 0) + t.amount;
      }
    });

    const netSavings = monthIncome - monthExpenses;
    const savingsRate = monthIncome > 0 ? Math.round((netSavings / monthIncome) * 100) : 0;

    const topCategories = Object.entries(monthCategorySpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const monthName = now.toLocaleString("en-IN", { month: "long", year: "numeric" });

    const lines = [
      `## User Financial Summary (${monthName})`,
      `- Net Worth: ${formatINR(netWorth)} (Liquid Cash: ${formatINR(totalBankBalance)} | Portfolio: ${formatINR(totalInvestments)})`,
      `- Month Income: ${formatINR(monthIncome)}`,
      `- Month Expenses: ${formatINR(monthExpenses)}`,
      `- Net Monthly Savings: ${formatINR(netSavings)} (Savings Rate: ${savingsRate}%)`,
      `- Investment P&L: ${investmentGainLoss >= 0 ? "+" : ""}${formatINR(investmentGainLoss)} (${totalInvestedPrincipal > 0 ? Math.round((investmentGainLoss / totalInvestedPrincipal) * 100) : 0}% total return)`,
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
      `### Active Budgets & Adherence (${budgets.length})`,
      budgets.length === 0
        ? `- No budgets defined yet.`
        : budgets
            .map((b) => {
              const catName = b.category?.name ?? "Category";
              const spent = monthCategorySpend[catName] ?? 0;
              const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
              const status = pct > 100 ? "EXCEEDED" : pct >= 85 ? "AT_RISK" : "ON_TRACK";
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
              const ret =
                inv.investedAmount > 0 ? Math.round((gain / inv.investedAmount) * 100) : 0;
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
}

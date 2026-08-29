import { Injectable } from "@nestjs/common";
import { formatINR } from "@finai/finance-engine";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ContextBuilderService {
  constructor(private prisma: PrismaService) {}

  async buildFinanceContext(userId: string): Promise<string> {
    const [accounts, recentTxns, budgets, goals, investments] = await Promise.all([
      this.prisma.client.account.findMany({
        where: { userId, isActive: true },
        select: { name: true, type: true, balance: true },
      }),
      this.prisma.client.transaction.findMany({
        where: { userId },
        include: { category: { select: { name: true, group: true } } },
        orderBy: { date: "desc" },
        take: 30,
      }),
      this.prisma.client.budget.findMany({
        where: { userId },
        include: { category: { select: { name: true } } },
      }),
      this.prisma.client.goal.findMany({ where: { userId } }),
      this.prisma.client.investment.findMany({ where: { userId } }),
    ]);

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0);

    // Calculate category spending breakdown for recent transactions
    const categoryTotals: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    recentTxns.forEach((t) => {
      if (t.type === "INCOME") {
        totalIncome += t.amount;
      } else if (t.type === "EXPENSE") {
        totalExpenses += t.amount;
        const catName = t.category?.name ?? "Other";
        categoryTotals[catName] = (categoryTotals[catName] ?? 0) + t.amount;
      }
    });

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const lines = [
      `## FinAI User Financial Context`,
      `Total Liquidity / Bank Balance: ${formatINR(totalBalance)}`,
      `Total Portfolio Investments: ${formatINR(totalInvestments)}`,
      `Recent Income (sample): ${formatINR(totalIncome)}`,
      `Recent Expenses (sample): ${formatINR(totalExpenses)}`,
      `Net Cash Flow (sample): ${formatINR(totalIncome - totalExpenses)}`,
      ``,
      `### Accounts (${accounts.length})`,
      ...accounts.map((a) => `- ${a.name} (${a.type}): ${formatINR(a.balance)}`),
      ``,
      `### Top Expense Categories (recent)`,
      ...topCategories.map(([cat, amt]) => `- ${cat}: ${formatINR(amt)}`),
      ``,
      `### Recent Transactions (last 30)`,
      ...recentTxns.map(
        (t) =>
          `- ${t.date.toISOString().slice(0, 10)} | [${t.type}] | ${t.category?.name ?? "General"} | ${formatINR(t.amount)}${t.notes ? ` (${t.notes})` : ""}`,
      ),
      ``,
      `### Active Budgets (${budgets.length})`,
      ...budgets.map(
        (b) => `- ${b.category?.name ?? "Category"}: Monthly Limit ${formatINR(b.limit)}`,
      ),
      ``,
      `### Financial Savings Goals (${goals.length})`,
      ...goals.map(
        (g) =>
          `- ${g.name}: Saved ${formatINR(g.currentAmount)} of ${formatINR(g.targetAmount)} (Target Date: ${g.deadline ? g.deadline.toISOString().slice(0, 10) : "N/A"})`,
      ),
      ``,
      `### Investments Portfolio (${investments.length})`,
      ...investments.map(
        (inv) =>
          `- ${inv.name} (${inv.assetClass}): Value ${formatINR(inv.currentValue)} (Invested: ${formatINR(inv.investedAmount)})`,
      ),
    ];

    return lines.join("\n");
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ContextBuilderService {
  constructor(private prisma: PrismaService) {}

  async buildFinanceContext(workspaceId: string): Promise<string> {
    const [accounts, recentTxns, budgets, goals, investments] = await Promise.all([
      this.prisma.client.account.findMany({
        where: { workspaceId, isActive: true },
        select: { name: true, type: true, balance: true },
      }),
      this.prisma.client.transaction.findMany({
        where: { workspaceId },
        include: { category: { select: { name: true, group: true } } },
        orderBy: { date: "desc" },
        take: 30,
      }),
      this.prisma.client.budget.findMany({
        where: { workspaceId },
        include: { category: { select: { name: true } } },
      }),
      this.prisma.client.goal.findMany({ where: { workspaceId } }),
      this.prisma.client.investment.findMany({ where: { workspaceId } }),
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
      `Total Liquidity / Bank Balance: ₹${totalBalance.toLocaleString("en-IN")}`,
      `Total Portfolio Investments: ₹${totalInvestments.toLocaleString("en-IN")}`,
      `Recent Income (sample): ₹${totalIncome.toLocaleString("en-IN")}`,
      `Recent Expenses (sample): ₹${totalExpenses.toLocaleString("en-IN")}`,
      `Net Cash Flow (sample): ₹${(totalIncome - totalExpenses).toLocaleString("en-IN")}`,
      ``,
      `### Accounts (${accounts.length})`,
      ...accounts.map((a) => `- ${a.name} (${a.type}): ₹${a.balance.toLocaleString("en-IN")}`),
      ``,
      `### Top Expense Categories (recent)`,
      ...topCategories.map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString("en-IN")}`),
      ``,
      `### Recent Transactions (last 30)`,
      ...recentTxns.map(
        (t) =>
          `- ${t.date.toISOString().slice(0, 10)} | [${t.type}] | ${t.category?.name ?? "General"} | ₹${t.amount.toLocaleString("en-IN")}${t.notes ? ` (${t.notes})` : ""}`,
      ),
      ``,
      `### Active Budgets (${budgets.length})`,
      ...budgets.map(
        (b) =>
          `- ${b.category?.name ?? "Category"}: Limit ₹${b.limit.toLocaleString("en-IN")} (${b.period})`,
      ),
      ``,
      `### Financial Savings Goals (${goals.length})`,
      ...goals.map(
        (g) =>
          `- ${g.name} [${g.type}]: Saved ₹${g.currentAmount.toLocaleString("en-IN")} of ₹${g.targetAmount.toLocaleString("en-IN")} (Target Date: ${g.deadline ? g.deadline.toISOString().slice(0, 10) : "N/A"})`,
      ),
      ``,
      `### Investments Portfolio (${investments.length})`,
      ...investments.map(
        (inv) =>
          `- ${inv.name} (${inv.assetClass}): Value ₹${inv.currentValue.toLocaleString("en-IN")} (Invested: ₹${inv.investedAmount.toLocaleString("en-IN")})`,
      ),
    ];

    return lines.join("\n");
  }
}

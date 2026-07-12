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
        include: { category: { select: { name: true } } },
        orderBy: { date: "desc" },
        take: 20,
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

    const lines = [
      `## User Financial Context`,
      `Total bank balance: ₹${totalBalance.toLocaleString("en-IN")}`,
      `Total investments: ₹${totalInvestments.toLocaleString("en-IN")}`,
      ``,
      `### Accounts (${accounts.length})`,
      ...accounts.map((a) => `- ${a.name} (${a.type}): ₹${a.balance.toLocaleString("en-IN")}`),
      ``,
      `### Recent Transactions (last 20)`,
      ...recentTxns.map(
        (t) =>
          `- ${t.date.toISOString().slice(0, 10)} | ${t.merchant} | ${t.category?.name ?? "Unknown"} | ₹${t.amount.toLocaleString("en-IN")}`,
      ),
      ``,
      `### Budget Status (${budgets.length} budgets)`,
      ...budgets.map(
        (b) => `- ${b.category?.name ?? "Unknown"}: limit ₹${b.limit.toLocaleString("en-IN")}`,
      ),
      ``,
      `### Financial Goals (${goals.length} goals)`,
      ...goals.map(
        (g) =>
          `- ${g.name}: ₹${g.currentAmount.toLocaleString("en-IN")} / ₹${g.targetAmount.toLocaleString("en-IN")} (deadline: ${g.deadline?.toISOString().slice(0, 10) ?? "none"})`,
      ),
    ];

    return lines.join("\n");
  }
}

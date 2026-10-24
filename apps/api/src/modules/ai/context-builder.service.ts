/**
 * @file apps/api/src/modules/ai/context-builder.service.ts
 * @description Builds a comprehensive text snapshot of the user's financial life for the LLM's system prompt.
 * @module @finai/api/ai/context-builder
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { TransactionType } from "@finai/shared-types";
import { formatFinanceContextMarkdown } from "./context-formatters";

@Injectable()
export class ContextBuilderService {
  private readonly logger = new Logger(ContextBuilderService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Assembles the full financial snapshot for a user.
   */
  async buildFinanceContext(userId: string): Promise<string> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [accounts, monthTxns, recentTxns, budgets, goals, investments, categories] =
      await Promise.all([
        this.prisma.client.account.findMany({
          where: { userId, isActive: true },
          select: { name: true, type: true, balance: true, currency: true },
        }),
        this.prisma.client.transaction.findMany({
          where: { userId, date: { gte: startOfMonth } },
          include: { category: { select: { name: true, group: true } } },
        }),
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
        this.prisma.client.goal.findMany({
          where: { userId },
          orderBy: { deadline: "asc" },
        }),
        this.prisma.client.investment.findMany({
          where: { userId },
        }),
        this.prisma.client.category.findMany({
          where: { userId },
          select: { name: true },
          orderBy: { name: "asc" },
        }),
      ]);

    const netWorth = accounts.reduce((acc, a) => acc + a.balance, 0);

    let monthIncome = 0;
    let monthExpenses = 0;
    const monthCategorySpend: Record<string, number> = {};

    monthTxns.forEach((t) => {
      if (t.type === TransactionType.INCOME) {
        monthIncome += t.amount;
      } else if (t.type === TransactionType.EXPENSE) {
        monthExpenses += t.amount;
        const cat = t.category?.name ?? "Uncategorized";
        monthCategorySpend[cat] = (monthCategorySpend[cat] ?? 0) + t.amount;
      }
    });

    const monthSavings = monthIncome - monthExpenses;
    const savingsRate = monthIncome > 0 ? Math.round((monthSavings / monthIncome) * 100) : 0;

    const topCategories = Object.entries(monthCategorySpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const portfolioValue = investments.reduce((acc, i) => acc + i.currentValue, 0);
    const totalInvested = investments.reduce((acc, i) => acc + i.investedAmount, 0);
    const unrealizedGain = portfolioValue - totalInvested;
    const portfolioReturnPct =
      totalInvested > 0 ? Math.round((unrealizedGain / totalInvested) * 100) : 0;

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;

    const snapshot = formatFinanceContextMarkdown({
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
    });

    this.logger.info(
      `Built finance context for user ${userId.slice(0, 8)}: ${accounts.length} accounts, ${monthTxns.length} monthly txns, ${budgets.length} budgets, ${goals.length} goals, ${investments.length} investments — ${snapshot.length} chars`,
    );
    return snapshot;
  }
}

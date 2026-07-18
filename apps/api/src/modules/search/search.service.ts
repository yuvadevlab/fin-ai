import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface SearchResults {
  transactions: {
    id: string;
    amount: number;
    date: string;
    notes: string | null;
    type: string;
    categoryName: string;
    accountName: string;
  }[];
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
  }[];
  goals: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
  }[];
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(workspaceId: string, q: string): Promise<SearchResults> {
    if (!q || q.trim().length < 2) {
      return { transactions: [], accounts: [], goals: [] };
    }

    const query = q.trim();

    const [transactions, accounts, goals] = await Promise.all([
      // Search transactions by notes, category name, or account name
      this.prisma.client.transaction.findMany({
        where: {
          workspaceId,
          OR: [
            { notes: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } },
            { account: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: {
          category: { select: { name: true } },
          account: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        take: 8,
      }),

      // Search accounts by name
      this.prisma.client.account.findMany({
        where: {
          workspaceId,
          isActive: true,
          name: { contains: query, mode: "insensitive" },
        },
        select: { id: true, name: true, type: true, balance: true },
        take: 5,
      }),

      // Search goals by name
      this.prisma.client.goal.findMany({
        where: {
          workspaceId,
          name: { contains: query, mode: "insensitive" },
        },
        select: { id: true, name: true, targetAmount: true, currentAmount: true },
        take: 5,
      }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        date: t.date.toISOString(),
        notes: t.notes,
        type: t.type,
        categoryName: t.category?.name ?? "Uncategorized",
        accountName: t.account?.name ?? "Unknown",
      })),
      accounts,
      goals,
    };
  }
}

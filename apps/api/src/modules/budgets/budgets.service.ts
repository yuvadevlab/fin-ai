import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBudgetInput, UpdateBudgetInput } from "@finai/validation";
import { calculateBudgetStatus } from "@finai/finance-engine";
import { BudgetPeriod, TransactionType } from "@finai/database";

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string) {
    const budgets = await this.prisma.client.budget.findMany({
      where: { workspaceId },
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return Promise.all(
      budgets.map(async (budget) => {
        const agg = await this.prisma.client.transaction.aggregate({
          where: {
            workspaceId,
            categoryId: budget.categoryId,
            type: TransactionType.EXPENSE,
            date: {
              gte: budget.startDate ?? startOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spent = agg._sum.amount ?? 0;
        const status = calculateBudgetStatus(spent, budget.limit);
        return { ...budget, spent, status };
      }),
    );
  }

  async findOne(id: string, workspaceId: string) {
    const budget = await this.prisma.client.budget.findFirst({
      where: { id, workspaceId },
      include: { category: true },
    });
    if (!budget) throw new NotFoundException(`Budget ${id} not found`);
    return budget;
  }

  async create(workspaceId: string, input: CreateBudgetInput) {
    return this.prisma.client.budget.create({
      data: {
        workspaceId,
        categoryId: input.categoryId,
        limit: input.limit,
        period: (input.period as BudgetPeriod) ?? BudgetPeriod.MONTHLY,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
      },
      include: { category: true },
    });
  }

  async update(id: string, workspaceId: string, input: UpdateBudgetInput) {
    await this.findOne(id, workspaceId);
    return this.prisma.client.budget.update({
      where: { id },
      data: {
        ...(input.limit !== undefined && { limit: input.limit }),
        ...(input.period !== undefined && {
          period: input.period as BudgetPeriod,
        }),
      },
      include: { category: true },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    await this.prisma.client.budget.delete({ where: { id } });
    return { deleted: true };
  }
}

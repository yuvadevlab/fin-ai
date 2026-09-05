import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateGoalInput, UpdateGoalInput } from "@finai/validation";
import { calculateGoalProgress } from "@finai/finance-engine";
import { GoalType } from "@finai/database";

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.client.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return goals.map((goal) => ({
      ...goal,
      progress: calculateGoalProgress(goal.currentAmount, goal.targetAmount),
    }));
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.client.goal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new NotFoundException(`Goal ${id} not found`);
    return goal;
  }

  async create(userId: string, input: CreateGoalInput) {
    return this.prisma.client.goal.create({
      data: {
        userId,
        name: input.name,
        targetAmount: input.targetAmount,
        currentAmount: input.currentAmount ?? 0,
        deadline: input.deadline ? new Date(input.deadline) : null,
        type: input.type ?? GoalType.PERSONAL,
      },
    });
  }

  async update(id: string, userId: string, input: UpdateGoalInput) {
    await this.findOne(id, userId);
    return this.prisma.client.goal.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.targetAmount !== undefined && {
          targetAmount: input.targetAmount,
        }),
        ...(input.currentAmount !== undefined && {
          currentAmount: input.currentAmount,
        }),
        ...(input.deadline !== undefined && {
          deadline: input.deadline ? new Date(input.deadline) : null,
        }),
        ...(input.type !== undefined && { type: input.type }),
      },
    });
  }

  async contribute(id: string, userId: string, amount: number) {
    const goal = await this.findOne(id, userId);
    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    return this.prisma.client.goal.update({
      where: { id },
      data: { currentAmount: newAmount },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.client.goal.delete({ where: { id } });
    return { deleted: true };
  }
}

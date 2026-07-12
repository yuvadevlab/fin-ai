import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGoalInput, UpdateGoalInput } from "@finai/validation";
import { calculateGoalProgress } from "@finai/finance-engine";
import { GoalType } from "@finai/database";

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string) {
    const goals = await this.prisma.client.goal.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return goals.map((goal) => ({
      ...goal,
      progress: calculateGoalProgress(goal.currentAmount, goal.targetAmount),
    }));
  }

  async findOne(id: string, workspaceId: string) {
    const goal = await this.prisma.client.goal.findFirst({
      where: { id, workspaceId },
    });
    if (!goal) throw new NotFoundException(`Goal ${id} not found`);
    return goal;
  }

  async create(workspaceId: string, input: CreateGoalInput) {
    return this.prisma.client.goal.create({
      data: {
        workspaceId,
        name: input.name,
        targetAmount: input.targetAmount,
        currentAmount: input.currentAmount ?? 0,
        deadline: input.deadline ? new Date(input.deadline) : null,
        type: (input.type as GoalType) ?? GoalType.PERSONAL,
      },
    });
  }

  async update(id: string, workspaceId: string, input: UpdateGoalInput) {
    await this.findOne(id, workspaceId);
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
          deadline: new Date(input.deadline),
        }),
      },
    });
  }

  async contribute(id: string, workspaceId: string, amount: number) {
    const goal = await this.findOne(id, workspaceId);
    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    return this.prisma.client.goal.update({
      where: { id },
      data: { currentAmount: newAmount },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    await this.prisma.client.goal.delete({ where: { id } });
    return { deleted: true };
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateGoalInput, UpdateGoalInput } from "@finai/validation";
import { calculateGoalProgress } from "@finai/finance-engine";
import { GoalType, Prisma } from "@finai/database";

@Injectable()
export class GoalsService {
  private readonly logger = new Logger(GoalsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, workspaceId?: string) {
    this.logger.info(`[findAll] Listing goals for user ${userId.slice(0, 8)}`);
    const where: Prisma.GoalWhereInput = workspaceId
      ? {
          OR: [{ workspaceId }, { workspaceId: null, userId }],
        }
      : { userId };

    const goals = await this.prisma.client.goal.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    this.logger.info(`[findAll] Found ${goals.length} goal(s) for user ${userId.slice(0, 8)}`);
    return goals.map((goal) => ({
      ...goal,
      progress: calculateGoalProgress(goal.currentAmount, goal.targetAmount),
    }));
  }

  async findOne(id: string, userId: string, workspaceId?: string) {
    this.logger.info(`[findOne] Looking up goal ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    const where: Prisma.GoalWhereInput = {
      id,
      ...(workspaceId
        ? {
            OR: [{ workspaceId }, { workspaceId: null, userId }],
          }
        : { userId }),
    };

    const goal = await this.prisma.client.goal.findFirst({ where });
    if (!goal) {
      this.logger.warn(`[findOne] Goal ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`);
      throw new NotFoundException(`Goal ${id} not found`);
    }
    return goal;
  }

  async create(userId: string, input: CreateGoalInput, workspaceId?: string) {
    this.logger.info(
      `[create] Creating goal "${input.name}" target: ${input.targetAmount} for user ${userId.slice(0, 8)}`,
    );
    const goal = await this.prisma.client.goal.create({
      data: {
        userId,
        ...(workspaceId && { workspaceId }),
        name: input.name,
        targetAmount: input.targetAmount,
        currentAmount: input.currentAmount ?? 0,
        deadline: input.deadline ? new Date(input.deadline) : null,
        type: input.type ?? GoalType.PERSONAL,
      },
    });
    this.logger.info(
      `Created goal "${goal.name}" target: ${goal.targetAmount} for user ${userId.slice(0, 8)}`,
    );
    return goal;
  }

  async update(id: string, userId: string, input: UpdateGoalInput, workspaceId?: string) {
    this.logger.info(`[update] Updating goal ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    await this.findOne(id, userId, workspaceId);
    const updated = await this.prisma.client.goal.update({
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
    this.logger.info(`Updated goal ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return updated;
  }

  async contribute(id: string, userId: string, amount: number, workspaceId?: string) {
    this.logger.info(
      `[contribute] Contributing ${amount} to goal ${id.slice(0, 8)} (user: ${userId.slice(0, 8)})`,
    );
    const goal = await this.findOne(id, userId, workspaceId);
    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    if (goal.currentAmount + amount > goal.targetAmount) {
      this.logger.warn(
        `[contribute] Contribution capped at target: requested ${goal.currentAmount + amount}, capped to ${goal.targetAmount}`,
      );
    }
    const updated = await this.prisma.client.goal.update({
      where: { id },
      data: { currentAmount: newAmount },
    });
    this.logger.info(
      `Contributed ${amount} to goal ${id.slice(0, 8)} → ${newAmount}/${goal.targetAmount} (user: ${userId.slice(0, 8)})`,
    );
    return updated;
  }

  async remove(id: string, userId: string, workspaceId?: string) {
    this.logger.info(`[remove] Deleting goal ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    await this.findOne(id, userId, workspaceId);
    await this.prisma.client.goal.delete({ where: { id } });
    this.logger.info(`Deleted goal ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return { deleted: true };
  }
}

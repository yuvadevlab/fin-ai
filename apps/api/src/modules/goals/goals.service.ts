import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateGoalInput, UpdateGoalInput } from "@finai/validation";
import { calculateGoalProgress } from "@finai/finance-engine";
import { GoalType } from "@finai/database";

/**
 * Savings goals service.
 *
 * Goals represent a user's savings targets (emergency fund, vacation, etc.).
 * Each goal tracks a current amount and a target amount. The progress
 * percentage is computed by the pure `calculateGoalProgress` helper.
 */
@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lists all goals for a user with their progress percentage computed.
   * Progress is always between 0 and 100 (capped — exceeding the target
   * doesn't report >100%).
   */
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

  /** Finds a single goal by ID, scoped to the user. Throws if not found. */
  async findOne(id: string, userId: string) {
    const goal = await this.prisma.client.goal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new NotFoundException(`Goal ${id} not found`);
    return goal;
  }

  /** Creates a new savings goal. currentAmount defaults to 0 if omitted. */
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

  /** Updates one or more mutable fields of a goal. Only provided fields are changed. */
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

  /**
   * Adds a contribution to a goal. The contribution is capped at the target —
   * you can't over-contribute and end up with a currentAmount > targetAmount.
   * This keeps the progress calculation clean (always ≤ 100%).
   */
  async contribute(id: string, userId: string, amount: number) {
    const goal = await this.findOne(id, userId);
    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    return this.prisma.client.goal.update({
      where: { id },
      data: { currentAmount: newAmount },
    });
  }

  /** Deletes a goal. The goal must belong to the user (enforced by findOne). */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.client.goal.delete({ where: { id } });
    return { deleted: true };
  }
}

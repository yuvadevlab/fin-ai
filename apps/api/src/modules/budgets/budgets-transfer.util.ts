import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { Logger } from "@yuva-devlab/logger";

const logger = new Logger("BudgetsTransferHelper");

export async function transferBudgetAllocation(
  prisma: PrismaService,
  userId: string,
  fromBudgetId: string,
  toBudgetId: string,
  amount: number,
) {
  logger.info(
    `[transferBudgetAllocation] Transferring ${amount} from ${fromBudgetId.slice(0, 8)} to ${toBudgetId.slice(0, 8)} for user ${userId.slice(0, 8)}`,
  );
  if (fromBudgetId === toBudgetId) {
    logger.warn(
      `[transferBudgetAllocation] Source and target budgets are the same: ${fromBudgetId.slice(0, 8)}`,
    );
    throw new BadRequestException("Source and target budgets must be different");
  }
  if (amount <= 0) {
    logger.warn(`[transferBudgetAllocation] Invalid transfer amount: ${amount}`);
    throw new BadRequestException("Transfer amount must be positive");
  }

  return prisma.client.$transaction(async (tx) => {
    const [fromBudget, toBudget] = await Promise.all([
      tx.budget.findFirst({ where: { id: fromBudgetId, userId } }),
      tx.budget.findFirst({ where: { id: toBudgetId, userId } }),
    ]);
    if (!fromBudget) {
      logger.warn(
        `[transferBudgetAllocation] Source budget ${fromBudgetId.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException(`Budget ${fromBudgetId} not found`);
    }
    if (!toBudget) {
      logger.warn(
        `[transferBudgetAllocation] Target budget ${toBudgetId.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException(`Budget ${toBudgetId} not found`);
    }
    if (fromBudget.limit - amount < 0) {
      logger.warn(
        `[transferBudgetAllocation] Insufficient funds in source budget ${fromBudgetId.slice(0, 8)}: limit ${fromBudget.limit}, transfer ${amount}`,
      );
      throw new BadRequestException("Transfer amount exceeds the source budget limit");
    }

    await tx.budget.update({
      where: { id: fromBudget.id },
      data: { limit: { decrement: amount } },
    });
    const result = await tx.budget.update({
      where: { id: toBudget.id },
      data: { limit: { increment: amount } },
      include: { category: true },
    });
    logger.info(
      `[transferBudgetAllocation] Transferred ${amount} from ${fromBudgetId.slice(0, 8)} to ${toBudgetId.slice(0, 8)}`,
    );
    return result;
  });
}

import { BadRequestException } from "@nestjs/common";
import { Prisma, TransactionType } from "@finai/database";
import { getTransactionImpact } from "./balance-impact.utils";

export interface OwnedReferenceRefs {
  accountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  investmentId?: string | null;
  goalId?: string | null;
}

/** Validates that referenced accounts, categories, investments, and goals belong to the user. */
export async function assertOwnedReferences(
  prisma: Prisma.TransactionClient,
  userId: string,
  refs: OwnedReferenceRefs,
): Promise<void> {
  const missing: string[] = [];
  if (
    refs.accountId &&
    !(await prisma.account.findFirst({
      where: { id: refs.accountId, userId, isActive: true },
      select: { id: true },
    }))
  ) {
    missing.push(`account ${refs.accountId}`);
  }
  if (
    refs.toAccountId &&
    !(await prisma.account.findFirst({
      where: { id: refs.toAccountId, userId, isActive: true },
      select: { id: true },
    }))
  ) {
    missing.push(`destination account ${refs.toAccountId}`);
  }
  if (
    refs.categoryId &&
    !(await prisma.category.findFirst({
      where: { id: refs.categoryId, userId },
      select: { id: true },
    }))
  ) {
    missing.push(`category ${refs.categoryId}`);
  }
  if (
    refs.investmentId &&
    !(await prisma.investment.findFirst({
      where: { id: refs.investmentId, userId },
      select: { id: true },
    }))
  ) {
    missing.push(`investment ${refs.investmentId}`);
  }
  if (
    refs.goalId &&
    !(await prisma.goal.findFirst({
      where: { id: refs.goalId, userId },
      select: { id: true },
    }))
  ) {
    missing.push(`goal ${refs.goalId}`);
  }
  if (missing.length > 0) {
    throw new BadRequestException(
      `Cannot record transaction: ${missing.join(", ")} not found for this user`,
    );
  }
}

/** Applies balance, investment, or goal changes inside an active Prisma transaction. */
export async function applyTransactionImpact(
  txClient: Prisma.TransactionClient,
  type: TransactionType,
  amount: number,
  refs: {
    accountId?: string | null;
    toAccountId?: string | null;
    investmentId?: string | null;
    goalId?: string | null;
  },
  multiplier = 1,
): Promise<void> {
  const { accountChange, toAccountChange } = getTransactionImpact(type, amount);
  if (refs.accountId && accountChange !== 0) {
    await txClient.account.update({
      where: { id: refs.accountId },
      data: { balance: { increment: accountChange * multiplier } },
    });
  }
  if (refs.toAccountId && toAccountChange !== 0) {
    await txClient.account.update({
      where: { id: refs.toAccountId },
      data: { balance: { increment: toAccountChange * multiplier } },
    });
  }
  if (type === TransactionType.INVESTMENT && refs.investmentId) {
    await txClient.investment.update({
      where: { id: refs.investmentId },
      data: {
        investedAmount: { increment: amount * multiplier },
        currentValue: { increment: amount * multiplier },
      },
    });
  }
  if (type === TransactionType.GOAL && refs.goalId) {
    await txClient.goal.update({
      where: { id: refs.goalId },
      data: { currentAmount: { increment: amount * multiplier } },
    });
  }
}

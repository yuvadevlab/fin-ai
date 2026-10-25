import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { TransactionType } from "@finai/database";
import type { CreateTransactionInput, UpdateTransactionInput } from "@finai/validation";
import { TransactionsRepository } from "../repositories";
import { TransactionsBulkService } from "./transactions-bulk.service";

/**
 * Handles atomic create, update, delete, and bulk import of transactions.
 * All write operations run inside a Prisma `$transaction` so the record
 * and the account balance update commit atomically.
 */
@Injectable()
export class TransactionsMutationService {
  private readonly logger = new Logger(TransactionsMutationService.name);

  constructor(
    private prisma: PrismaService,
    private repo: TransactionsRepository,
    private bulkService: TransactionsBulkService,
  ) {}

  async create(userId: string, input: CreateTransactionInput, workspaceId?: string) {
    this.logger.info(
      `[create] Creating ${input.type} transaction amount: ${input.amount} (user: ${userId.slice(0, 8)})`,
    );
    await this.repo.assertOwnedRefs(userId, {
      accountId: input.accountId,
      toAccountId: input.toAccountId,
      categoryId: input.categoryId,
      investmentId: input.investmentId,
      goalId: input.goalId,
    });

    return this.prisma.client.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          ...(workspaceId && { workspaceId }),
          accountId: input.accountId,
          toAccountId: input.toAccountId,
          categoryId: input.categoryId,
          investmentId: input.type === TransactionType.INVESTMENT ? input.investmentId : null,
          goalId: input.type === TransactionType.GOAL ? input.goalId : null,
          amount: input.amount,
          date: new Date(input.date),
          notes: input.notes,
          type: input.type as TransactionType,
        },
        include: {
          category: true,
          account: true,
          toAccount: true,
          investment: true,
          goal: true,
        },
      });

      await this.repo.applyImpact(
        tx,
        transaction.type,
        transaction.amount,
        transaction.accountId,
        transaction.toAccountId,
        transaction.investmentId,
        transaction.goalId,
        1,
      );

      this.logger.info(
        `Created transaction [${transaction.type}] ${transaction.amount} for user ${userId.slice(0, 8)} (id: ${transaction.id.slice(0, 8)})`,
      );
      return transaction;
    });
  }

  async createBulk(userId: string, inputs: CreateTransactionInput[], workspaceId?: string) {
    return this.bulkService.createBulk(userId, inputs, workspaceId);
  }

  async update(id: string, userId: string, input: UpdateTransactionInput, workspaceId?: string) {
    await this.repo.assertOwnedRefs(userId, {
      accountId: input.accountId,
      toAccountId: input.toAccountId,
      categoryId: input.categoryId,
      investmentId: input.investmentId,
      goalId: input.goalId,
    });

    return this.prisma.client.$transaction(async (tx) => {
      const oldTx = await this.repo.findOne(id, userId, workspaceId);
      if (!oldTx) throw new NotFoundException(`Transaction ${id} not found`);

      // Revert old impact
      await this.repo.applyImpact(
        tx,
        oldTx.type,
        oldTx.amount,
        oldTx.accountId,
        oldTx.toAccountId,
        oldTx.investmentId,
        oldTx.goalId,
        -1,
      );

      const targetType = (input.type as TransactionType) ?? oldTx.type;
      const targetInvestmentId =
        input.investmentId !== undefined
          ? targetType === TransactionType.INVESTMENT
            ? input.investmentId
            : null
          : targetType === TransactionType.INVESTMENT
            ? oldTx.investmentId
            : null;
      const targetGoalId =
        input.goalId !== undefined
          ? targetType === TransactionType.GOAL
            ? input.goalId
            : null
          : targetType === TransactionType.GOAL
            ? oldTx.goalId
            : null;

      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          ...(input.amount !== undefined && { amount: input.amount }),
          ...(input.date !== undefined && { date: new Date(input.date) }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(input.accountId !== undefined && { accountId: input.accountId }),
          ...(input.toAccountId !== undefined && { toAccountId: input.toAccountId }),
          ...(input.investmentId !== undefined && { investmentId: targetInvestmentId }),
          ...(input.goalId !== undefined && { goalId: targetGoalId }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.type !== undefined && { type: input.type as TransactionType }),
        },
        include: {
          category: true,
          account: true,
          toAccount: true,
          investment: true,
          goal: true,
        },
      });

      // Apply new impact
      await this.repo.applyImpact(
        tx,
        updatedTx.type,
        updatedTx.amount,
        updatedTx.accountId,
        updatedTx.toAccountId,
        updatedTx.investmentId,
        updatedTx.goalId,
        1,
      );

      this.logger.info(
        `Updated transaction ${id.slice(0, 8)} [${updatedTx.type}] ${updatedTx.amount} for user ${userId.slice(0, 8)}`,
      );
      return updatedTx;
    });
  }

  async remove(id: string, userId: string, workspaceId?: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const oldTx = await this.repo.findOne(id, userId, workspaceId);
      if (!oldTx) throw new NotFoundException(`Transaction ${id} not found`);

      // Revert impact
      await this.repo.applyImpact(
        tx,
        oldTx.type,
        oldTx.amount,
        oldTx.accountId,
        oldTx.toAccountId,
        oldTx.investmentId,
        oldTx.goalId,
        -1,
      );

      await tx.transaction.delete({ where: { id } });
      this.logger.info(`Deleted transaction ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
      return { success: true };
    });
  }
}

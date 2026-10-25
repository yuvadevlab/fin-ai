import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { TransactionType } from "@finai/database";
import type { CreateTransactionInput } from "@finai/validation";
import { TransactionsRepository } from "../repositories";

@Injectable()
export class TransactionsBulkService {
  private readonly logger = new Logger(TransactionsBulkService.name);

  constructor(
    private prisma: PrismaService,
    private repo: TransactionsRepository,
  ) {}

  async createBulk(userId: string, inputs: CreateTransactionInput[], workspaceId?: string) {
    this.logger.info(
      `[createBulk] Bulk importing ${inputs.length} transaction(s) for user ${userId.slice(0, 8)}`,
    );
    for (const input of inputs) {
      await this.repo.assertOwnedRefs(userId, {
        accountId: input.accountId,
        toAccountId: input.toAccountId,
        categoryId: input.categoryId,
        investmentId: input.investmentId,
        goalId: input.goalId,
      });
    }

    return this.prisma.client.$transaction(async (tx) => {
      const created = [];
      for (const input of inputs) {
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
        created.push(transaction);
      }
      this.logger.info(
        `Bulk created ${created.length} transactions for user ${userId.slice(0, 8)}`,
      );
      return created;
    });
  }
}

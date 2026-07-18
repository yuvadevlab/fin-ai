import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, TransactionType } from "@finai/database";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
} from "@finai/validation";

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string, filter: TransactionFilterInput) {
    const where: Prisma.TransactionWhereInput = { workspaceId };

    if (filter.search) {
      where.notes = { contains: filter.search, mode: "insensitive" };
    }
    if (filter.category) where.categoryId = filter.category;
    if (filter.account) where.accountId = filter.account;
    if (filter.type) where.type = filter.type as TransactionType;

    if (filter.dateFrom || filter.dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filter.dateFrom) dateFilter.gte = new Date(filter.dateFrom);
      if (filter.dateTo) dateFilter.lte = new Date(filter.dateTo);
      where.date = dateFilter;
    }

    const page = filter.page ?? 1;
    const limit = filter.pageSize ?? 50;

    const [items, total] = await Promise.all([
      this.prisma.client.transaction.findMany({
        where,
        include: {
          category: true,
          account: { select: { id: true, name: true, type: true } },
          toAccount: { select: { id: true, name: true, type: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.transaction.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, workspaceId: string) {
    const tx = await this.prisma.client.transaction.findFirst({
      where: { id, workspaceId },
      include: { category: true, account: true, toAccount: true },
    });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
    return tx;
  }

  private getTransactionImpact(type: TransactionType, amount: number) {
    if (type === TransactionType.INCOME) {
      return { accountChange: amount, toAccountChange: 0 };
    }
    if (type === TransactionType.EXPENSE) {
      return { accountChange: -amount, toAccountChange: 0 };
    }
    if (type === TransactionType.TRANSFER) {
      return { accountChange: -amount, toAccountChange: amount };
    }
    return { accountChange: 0, toAccountChange: 0 };
  }

  private async applyImpact(
    txClient: Prisma.TransactionClient,
    type: TransactionType,
    amount: number,
    accountId?: string | null,
    toAccountId?: string | null,
    multiplier: number = 1,
  ) {
    const { accountChange, toAccountChange } = this.getTransactionImpact(type, amount);

    if (accountId && accountChange !== 0) {
      await txClient.account.update({
        where: { id: accountId },
        data: { balance: { increment: accountChange * multiplier } },
      });
    }

    if (toAccountId && toAccountChange !== 0) {
      await txClient.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: toAccountChange * multiplier } },
      });
    }
  }

  async create(workspaceId: string, input: CreateTransactionInput) {
    return this.prisma.client.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          workspaceId,
          accountId: input.accountId,
          toAccountId: input.toAccountId,
          categoryId: input.categoryId,
          amount: input.amount,
          date: new Date(input.date),
          notes: input.notes,
          type: input.type as TransactionType,
        },
        include: { category: true, account: true, toAccount: true },
      });

      await this.applyImpact(
        tx,
        transaction.type,
        transaction.amount,
        transaction.accountId,
        transaction.toAccountId,
        1,
      );

      return transaction;
    });
  }

  async update(id: string, workspaceId: string, input: UpdateTransactionInput) {
    return this.prisma.client.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, workspaceId },
      });
      if (!oldTx) throw new NotFoundException(`Transaction ${id} not found`);

      // Revert old impact
      await this.applyImpact(tx, oldTx.type, oldTx.amount, oldTx.accountId, oldTx.toAccountId, -1);

      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          ...(input.amount !== undefined && { amount: input.amount }),
          ...(input.date !== undefined && { date: new Date(input.date) }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(input.accountId !== undefined && { accountId: input.accountId }),
          ...(input.toAccountId !== undefined && { toAccountId: input.toAccountId }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.type !== undefined && {
            type: input.type as TransactionType,
          }),
        },
        include: { category: true, account: true, toAccount: true },
      });

      // Apply new impact
      await this.applyImpact(
        tx,
        updatedTx.type,
        updatedTx.amount,
        updatedTx.accountId,
        updatedTx.toAccountId,
        1,
      );

      return updatedTx;
    });
  }

  async remove(id: string, workspaceId: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, workspaceId },
      });
      if (!oldTx) throw new NotFoundException(`Transaction ${id} not found`);

      // Revert old impact
      await this.applyImpact(tx, oldTx.type, oldTx.amount, oldTx.accountId, oldTx.toAccountId, -1);

      await tx.transaction.delete({ where: { id } });
      return { deleted: true };
    });
  }
}

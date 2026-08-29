import { Injectable, NotFoundException } from "@nestjs/common";
import { AccountType } from "@finai/database";
import { CreateAccountInput, UpdateAccountInput } from "@finai/validation";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.client.account.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string, userId: string) {
    const account = await this.prisma.client.account.findFirst({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  async create(userId: string, input: CreateAccountInput) {
    return this.prisma.client.account.create({
      data: {
        userId,
        name: input.name,
        type: input.type as AccountType,
        balance: input.balance ?? 0,
        currency: input.currency ?? "INR",
      },
    });
  }

  async update(id: string, userId: string, input: UpdateAccountInput) {
    await this.findOne(id, userId);
    return this.prisma.client.account.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.balance !== undefined && { balance: input.balance }),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.client.account.update({
      where: { id },
      data: { isActive: false },
    });
    return { deleted: true };
  }
}

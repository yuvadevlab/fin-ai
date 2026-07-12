import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AccountType } from "@finai/database";
import { CreateAccountInput, UpdateAccountInput } from "@finai/validation";

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string) {
    return this.prisma.client.account.findMany({
      where: { workspaceId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const account = await this.prisma.client.account.findFirst({
      where: { id, workspaceId },
    });
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  async create(workspaceId: string, input: CreateAccountInput) {
    return this.prisma.client.account.create({
      data: {
        workspaceId,
        name: input.name,
        type: input.type as AccountType,
        balance: input.balance ?? 0,
        currency: input.currency ?? "INR",
      },
    });
  }

  async update(id: string, workspaceId: string, input: UpdateAccountInput) {
    await this.findOne(id, workspaceId);
    return this.prisma.client.account.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.balance !== undefined && { balance: input.balance }),
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    await this.prisma.client.account.update({
      where: { id },
      data: { isActive: false },
    });
    return { deleted: true };
  }
}

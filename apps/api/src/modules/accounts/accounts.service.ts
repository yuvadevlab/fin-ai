import { Injectable, NotFoundException } from "@nestjs/common";
import { AccountType, Prisma } from "@finai/database";
import { UserPreferences } from "@finai/shared-types";
import { type CreateAccountInput, type UpdateAccountInput } from "@finai/validation";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  /** Resolve the default account ID from user preferences. */
  private async getDefaultAccountId(userId: string): Promise<string | null> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    const prefs = (user?.preferences as unknown as UserPreferences) || {};
    return prefs.defaultAccountId ?? null;
  }

  /** Persist the default account ID into user preferences. */
  private async setDefaultAccountId(userId: string, accountId: string | null): Promise<void> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    const current = (user?.preferences as unknown as UserPreferences) || {};
    const updated: UserPreferences = { ...current };
    if (accountId === null) {
      delete updated.defaultAccountId;
    } else {
      updated.defaultAccountId = accountId;
    }
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { preferences: updated as unknown as Prisma.InputJsonValue },
    });
  }

  async findAll(userId: string) {
    const [accounts, defaultAccountId] = await Promise.all([
      this.prisma.client.account.findMany({
        where: { userId, isActive: true },
        orderBy: { name: "asc" },
      }),
      this.getDefaultAccountId(userId),
    ]);

    // Determine the resolved default: explicit preference or auto-select single account
    const resolvedDefaultId =
      defaultAccountId && accounts.some((a) => a.id === defaultAccountId)
        ? defaultAccountId
        : accounts.length === 1
          ? accounts[0].id
          : null;

    return accounts.map((a) => ({ ...a, isDefault: a.id === resolvedDefaultId }));
  }

  async findOne(id: string, userId: string) {
    const account = await this.prisma.client.account.findFirst({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  async create(userId: string, input: CreateAccountInput) {
    const account = await this.prisma.client.account.create({
      data: {
        userId,
        name: input.name,
        type: input.type as AccountType,
        balance: input.balance ?? 0,
        currency: input.currency ?? "INR",
      },
    });

    // Auto-set as default if explicitly requested OR if this is the first account
    if (input.isDefault) {
      await this.setDefaultAccountId(userId, account.id);
    } else {
      const count = await this.prisma.client.account.count({
        where: { userId, isActive: true },
      });
      if (count === 1) {
        await this.setDefaultAccountId(userId, account.id);
      }
    }

    return account;
  }

  async update(id: string, userId: string, input: UpdateAccountInput) {
    await this.findOne(id, userId);
    if (input.isDefault === true) {
      await this.setDefaultAccountId(userId, id);
    }
    return this.prisma.client.account.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.balance !== undefined && { balance: input.balance }),
      },
    });
  }

  async setDefault(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.setDefaultAccountId(userId, id);
    return { success: true };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    // Clear default preference if the deleted account was the default
    const defaultId = await this.getDefaultAccountId(userId);
    if (defaultId === id) {
      await this.setDefaultAccountId(userId, null);
    }
    await this.prisma.client.account.update({
      where: { id },
      data: { isActive: false },
    });
    return { deleted: true };
  }
}

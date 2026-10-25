import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { AccountType, Prisma } from "@finai/database";
import { type CreateAccountInput, type UpdateAccountInput } from "@finai/validation";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { getDefaultAccountId, setDefaultAccountId } from "./accounts-preferences.util";

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, workspaceId?: string) {
    this.logger.info(
      `[findAll] Listing accounts for user ${userId.slice(0, 8)} (workspace: ${workspaceId ? workspaceId.slice(0, 8) : "default"})`,
    );

    const where: Prisma.AccountWhereInput = {
      isActive: true,
      ...(workspaceId
        ? {
            OR: [{ workspaceId }, { workspaceId: null, userId }],
          }
        : { userId }),
    };

    const [accounts, defaultAccountId] = await Promise.all([
      this.prisma.client.account.findMany({
        where,
        orderBy: { name: "asc" },
      }),
      getDefaultAccountId(this.prisma, userId),
    ]);

    const resolvedDefaultId =
      defaultAccountId && accounts.some((a) => a.id === defaultAccountId)
        ? defaultAccountId
        : accounts.length === 1
          ? accounts[0].id
          : null;

    const enriched = accounts.map((a) => ({ ...a, isDefault: a.id === resolvedDefaultId }));
    this.logger.info(
      `Found ${enriched.length} active account(s) for user ${userId.slice(0, 8)}, default: ${resolvedDefaultId ? resolvedDefaultId.slice(0, 8) : "none"}`,
    );
    return enriched;
  }

  async findOne(id: string, userId: string, workspaceId?: string) {
    this.logger.info(
      `[findOne] Looking up account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const where: Prisma.AccountWhereInput = {
      id,
      isActive: true,
      ...(workspaceId
        ? {
            OR: [{ workspaceId }, { workspaceId: null, userId }],
          }
        : { userId }),
    };

    const account = await this.prisma.client.account.findFirst({ where });
    if (!account) {
      this.logger.warn(
        `[findOne] Account ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException(`Account ${id} not found`);
    }
    return account;
  }

  async create(userId: string, input: CreateAccountInput, workspaceId?: string) {
    const account = await this.prisma.client.account.create({
      data: {
        userId,
        ...(workspaceId && { workspaceId }),
        name: input.name,
        type: input.type as AccountType,
        balance: input.balance ?? 0,
        currency: input.currency ?? "INR",
      },
    });

    if (input.isDefault) {
      await setDefaultAccountId(this.prisma, userId, account.id);
    } else {
      const count = await this.prisma.client.account.count({
        where: { userId, isActive: true },
      });
      if (count === 1) {
        await setDefaultAccountId(this.prisma, userId, account.id);
      }
    }

    this.logger.info(
      `Created account "${account.name}" [${account.type}] for user ${userId.slice(0, 8)}`,
    );
    return account;
  }

  async update(id: string, userId: string, input: UpdateAccountInput, workspaceId?: string) {
    await this.findOne(id, userId, workspaceId);
    if (input.isDefault === true) {
      await setDefaultAccountId(this.prisma, userId, id);
    }
    const updated = await this.prisma.client.account.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.balance !== undefined && { balance: input.balance }),
      },
    });
    this.logger.info(`Updated account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return updated;
  }

  async setDefault(id: string, userId: string, workspaceId?: string) {
    await this.findOne(id, userId, workspaceId);
    await setDefaultAccountId(this.prisma, userId, id);
    this.logger.info(`Set default account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return { success: true };
  }

  async remove(id: string, userId: string, workspaceId?: string) {
    await this.findOne(id, userId, workspaceId);
    const defaultId = await getDefaultAccountId(this.prisma, userId);
    if (defaultId === id) {
      await setDefaultAccountId(this.prisma, userId, null);
    }
    await this.prisma.client.account.update({
      where: { id },
      data: { isActive: false },
    });
    this.logger.info(`Soft-deleted account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return { deleted: true };
  }
}

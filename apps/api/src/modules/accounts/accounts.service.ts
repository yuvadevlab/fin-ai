import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { AccountType, Prisma } from "@finai/database";
import { type CreateAccountInput, type UpdateAccountInput } from "@finai/validation";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { getDefaultAccountId, setDefaultAccountId } from "./accounts-preferences.util";

/**
 * Service for managing user accounts (bank accounts, credit cards, wallets).
 *
 * Accounts are the source of funds for transactions. Each user can have
 * multiple accounts, with one optionally marked as the default. Account
 * deletion is soft — the record is deactivated (`isActive: false`) rather
 * than hard-deleted, so historical transactions remain intact.
 *
 * All methods require `userId` and enforce ownership via Prisma `where` clauses.
 */
@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Returns all active accounts for the user, each annotated with `isDefault`.
   *
   * The "resolved default" logic:
   * 1. If the user has an explicit default preference AND that account still
   *    exists → use it.
   * 2. If the user has exactly one account → auto-default it (first-run UX).
   * 3. Otherwise → no default (user must pick explicitly).
   *
   * Runs the account fetch and default-preference read in parallel.
   */
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

  /**
   * Fetches a single account by ID, scoped to the user or workspace.
   * Throws `NotFoundException` if the account doesn't exist or belongs to
   * another user.
   */
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

  /**
   * Creates a new account for the user.
   *
   * Auto-default logic:
   * - If `input.isDefault` is explicitly true → set as default.
   * - Otherwise, if this is the user's FIRST active account → auto-set as
   *   default (so the user doesn't have to manually pick one on first run).
   */
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

  /**
   * Updates an account's name and/or balance.
   *
   * If `isDefault: true` is passed, the default-account preference is also
   * updated. Only the fields present in `input` are written (partial update).
   */
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

  /**
   * Marks an account as the user's default account.
   * Persists the preference via `setDefaultAccountId`.
   */
  async setDefault(id: string, userId: string, workspaceId?: string) {
    await this.findOne(id, userId, workspaceId);
    await setDefaultAccountId(this.prisma, userId, id);
    this.logger.info(`Set default account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return { success: true };
  }

  /**
   * Soft-deletes an account by setting `isActive: false`.
   *
   * The record is preserved so historical transactions still reference a
   * valid account. If the deleted account was the default, the default
   * preference is cleared so it doesn't point to a deactivated account.
   */
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

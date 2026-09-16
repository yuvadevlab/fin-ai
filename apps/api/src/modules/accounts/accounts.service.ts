import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@finai/logger";
import { AccountType, Prisma } from "@finai/database";
import { UserPreferences } from "@finai/shared-types";
import { type CreateAccountInput, type UpdateAccountInput } from "@finai/validation";
import { PrismaService } from "@/modules/prisma/prisma.service";

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
   * Reads the user's stored preference for a default account.
   *
   * The default account is persisted as JSON on the `User.preferences`
   * column (not a dedicated column), so we deserialize it here.
   * Returns `null` when no preference is set or the user has no preferences.
   */
  private async getDefaultAccountId(userId: string): Promise<string | null> {
    this.logger.debug(
      `[getDefaultAccountId] Reading default account preference for user ${userId.slice(0, 8)}`,
    );
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    const prefs = (user?.preferences as unknown as UserPreferences) || {};
    const defaultId = prefs.defaultAccountId ?? null;
    this.logger.debug(
      `[getDefaultAccountId] User ${userId.slice(0, 8)} default: ${defaultId ? defaultId.slice(0, 8) : "none"}`,
    );
    return defaultId;
  }

  /**
   * Persists (or clears) the user's default-account preference.
   *
   * Writes back the entire `preferences` JSON blob after mutating the
   * `defaultAccountId` field. Pass `null` to clear the default.
   *
   * Note: this does NOT validate that `accountId` belongs to the user —
   * callers must ensure ownership before calling.
   */
  private async setDefaultAccountId(userId: string, accountId: string | null): Promise<void> {
    this.logger.debug(
      `[setDefaultAccountId] Setting default for user ${userId.slice(0, 8)}: ${accountId ? accountId.slice(0, 8) : "clear"}`,
    );
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    const current = (user?.preferences as unknown as UserPreferences) || {};
    const updated: UserPreferences = { ...current };
    if (accountId === null) {
      this.logger.debug(`[setDefaultAccountId] Clearing default for user ${userId.slice(0, 8)}`);
      delete updated.defaultAccountId;
    } else {
      this.logger.debug(
        `[setDefaultAccountId] Setting default to ${accountId.slice(0, 8)} for user ${userId.slice(0, 8)}`,
      );
      updated.defaultAccountId = accountId;
    }
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { preferences: updated as unknown as Prisma.InputJsonValue },
    });
  }

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
  async findAll(userId: string) {
    this.logger.debug(`[findAll] Listing all accounts for user ${userId.slice(0, 8)}`);
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

    const enriched = accounts.map((a) => ({ ...a, isDefault: a.id === resolvedDefaultId }));
    this.logger.info(
      `Found ${enriched.length} active account(s) for user ${userId.slice(0, 8)}, default: ${resolvedDefaultId ? resolvedDefaultId.slice(0, 8) : "none"}`,
    );
    return enriched;
  }

  /**
   * Fetches a single account by ID, scoped to the user.
   * Throws `NotFoundException` if the account doesn't exist or belongs to
   * another user.
   */
  async findOne(id: string, userId: string) {
    this.logger.debug(
      `[findOne] Looking up account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const account = await this.prisma.client.account.findFirst({
      where: { id, userId },
    });
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

    this.logger.log(
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
  async update(id: string, userId: string, input: UpdateAccountInput) {
    await this.findOne(id, userId);
    if (input.isDefault === true) {
      await this.setDefaultAccountId(userId, id);
    }
    const updated = await this.prisma.client.account.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.balance !== undefined && { balance: input.balance }),
      },
    });
    this.logger.log(`Updated account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return updated;
  }

  /**
   * Marks an account as the user's default account.
   * Persists the preference via `setDefaultAccountId`.
   */
  async setDefault(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.setDefaultAccountId(userId, id);
    this.logger.log(`Set default account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return { success: true };
  }

  /**
   * Soft-deletes an account by setting `isActive: false`.
   *
   * The record is preserved so historical transactions still reference a
   * valid account. If the deleted account was the default, the default
   * preference is cleared so it doesn't point to a deactivated account.
   */
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
    this.logger.log(`Soft-deleted account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return { deleted: true };
  }
}

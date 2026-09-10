import { BadRequestException } from "@nestjs/common";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";

/**
 * Entity reference resolution for agent write tools.
 *
 * The LLM may reference an account/category by NAME ("groceries", "HDFC
 * account") or by the exact ID returned from a list/resolve tool. Resolving
 * here — at execute time, ownership-checked — means a fabricated UUID can
 * never reach the database as an FK violation.
 */

export {
  type EntityRef,
  type NamedEntity,
  splitRef,
  normalizeEntityName,
  scoreEntityMatch,
  bestEntityMatches,
  bestEntityMatch,
} from "./utils/entity-match.utils";
import {
  splitRef,
  scoreEntityMatch,
  bestEntityMatches,
  bestEntityMatch,
  type EntityRef,
  type NamedEntity,
} from "./utils/entity-match.utils";

// ─── Ownership-checked resolvers (I/O-bound, used at execute time) ──────────

/**
 * Resolve a category reference to { id, name }, ownership-checked.
 *
 * @param options.autoCreate When true (execute path, after user confirmation)
 *   an unknown NAME becomes a new category under "Variable Expenses". When
 *   false (propose-time validation) an unknown name throws with the three
 *   closest existing category names as suggestions.
 */
export async function resolveCategoryRef(
  categoriesService: CategoriesService,
  userId: string,
  ref: EntityRef,
  options: { autoCreate?: boolean } = {},
): Promise<NamedEntity> {
  // getCategories auto-seeds the default category set for new users.
  const categories = await categoriesService.getCategories(userId);

  if (ref.id) {
    const found = categories.find((c) => c.id === ref.id);
    if (!found) {
      throw new BadRequestException(`Category ${ref.id} was not found for this user`);
    }
    return { id: found.id, name: found.name };
  }

  if (ref.name) {
    const match = bestEntityMatch(categories, ref.name);
    if (match) return { id: match.id, name: match.name };

    // No match. Either auto-create (execute path, user confirmed) or throw
    // (propose-time validation / strict path).
    if (options.autoCreate) {
      const created = await categoriesService.createCategory(userId, {
        name: ref.name,
        // "Variable Expenses" is the catch-all group for user-created
        // categories; they can re-group it later in Category Manager.
        group: "Variable Expenses",
      });
      return { id: created.id, name: created.name };
    }

    // Best-effort "did you mean" hints: rank all categories by fuzzy score
    // and keep the top 3 so the error message nudges the model toward the
    // right existing category instead of proposing a duplicate one.
    const similar = categories
      .map((c) => ({ category: c, score: scoreEntityMatch(c.name, ref.name!) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((m) => m.category.name);
    const suggestion = similar.length > 0 ? ` Similar: ${similar.join(", ")}.` : "";
    throw new BadRequestException(
      `No category matches "${ref.name}".${suggestion} List your categories with categories.list or ask to create a new one.`,
    );
  }

  throw new BadRequestException("A category (category name or categoryId) is required");
}

/**
 * Resolve an account reference to { id, name }, ownership-checked. Unlike
 * categories, unknown account names never auto-create — accounts hold real
 * money and creating one by typo would silently misroute transactions.
 */
export async function resolveAccountRef(
  accountsService: AccountsService,
  userId: string,
  ref: EntityRef,
): Promise<NamedEntity> {
  const accounts = await accountsService.findAll(userId);

  if (ref.id) {
    const found = accounts.find((a) => a.id === ref.id);
    if (!found) {
      throw new BadRequestException(`Account ${ref.id} was not found for this user`);
    }
    return { id: found.id, name: found.name };
  }

  if (ref.name) {
    const matches = bestEntityMatches(accounts, ref.name);
    if (matches.length > 1) {
      // Genuinely ambiguous ("use SBI" with SBI Savings + SBI Salary): never
      // silently pick one — make the agent ask the user which account.
      const names = matches.map((a) => a.name).join(", ");
      throw new BadRequestException(
        `Multiple accounts match "${ref.name}": ${names}. Ask the user which account to use.`,
      );
    }
    if (matches.length === 1) {
      return { id: matches[0].id, name: matches[0].name };
    }
    throw new BadRequestException(
      `No account matches "${ref.name}". List your accounts with accounts.list or ask to create one.`,
    );
  }

  throw new BadRequestException("An account (account name or accountId) is required");
}

// ─── Transaction-specific combined resolution ────────────────────────────────

export {
  type RefCheckWarning,
  type TransactionRefCheckResult,
  type TransactionRefInput,
  checkTransactionRefs,
} from "./transaction-ref-checker";
import type { TransactionRefInput } from "./transaction-ref-checker";

/**
 * Resolve the account/category/optional to-account references of a
 * transaction input in one call. Name strings win over raw ids (the model
 * is instructed to prefer names), and every result is ownership-checked
 * before the write tools touch the database.
 */
export async function resolveTransactionRefs(
  accountsService: AccountsService,
  categoriesService: CategoriesService,
  userId: string,
  input: TransactionRefInput,
  options: { autoCreateCategory?: boolean } = {},
): Promise<{ accountId: string; categoryId: string; toAccountId: string | null }> {
  // Fetch accounts once — used for both explicit resolution and default fallback.
  const accounts = await accountsService.findAll(userId);

  // Account — resolve explicit reference, or fall back to the user's default account
  let accountId: string;
  const accountRef = splitRef(input.account) ?? { id: input.accountId ?? "" };
  if (accountRef.name || accountRef.id) {
    const resolved = await resolveAccountRef(accountsService, userId, accountRef);
    accountId = resolved.id;
  } else {
    // No account specified — use the user's default account (annotated by findAll)
    const defaultAccount = accounts.find((a) => a.isDefault);
    if (!defaultAccount) {
      throw new BadRequestException(
        "No account was specified and no default account is set. Specify an account (e.g. 'use HDFC') or set a default account in FinAI.",
      );
    }
    accountId = defaultAccount.id;
  }

  const category = await resolveCategoryRef(
    categoriesService,
    userId,
    splitRef(input.category) ?? { id: input.categoryId ?? "" },
    { autoCreate: options.autoCreateCategory },
  );

  let toAccountId: string | null = null;
  if (input.toAccount !== undefined) {
    toAccountId = (await resolveAccountRef(accountsService, userId, splitRef(input.toAccount)!)).id;
  } else if (input.toAccountId !== undefined) {
    toAccountId = input.toAccountId;
  }

  return { accountId, categoryId: category.id, toAccountId };
}

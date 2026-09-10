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

export interface EntityRef {
  id?: string | null;
  name?: string | null;
}

export interface NamedEntity {
  id: string;
  name: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Classify a raw string as an entity ID (UUID) or a display/search name. */
export function splitRef(value?: string | null): EntityRef | undefined {
  if (!value || value.trim().length === 0) return undefined;
  const trimmed = value.trim();
  return UUID_RE.test(trimmed) ? { id: trimmed } : { name: trimmed };
}

// ─── Pure fuzzy name matching (zero side effects) ───────────────────────────

const SEPARATOR_RE = /[&,._/+()[\]{}#-]+/g;

/**
 * Canonicalize a name for comparison: lowercase, separators (& , . _ / +
 * brackets # -) become spaces, whitespace collapsed. Lets "Groceries &
 * Supermarket" match a query of "groceries supermarket".
 */
export function normalizeEntityName(value: string): string {
  return value.toLowerCase().replace(SEPARATOR_RE, " ").replace(/\s+/g, " ").trim();
}

/**
 * Rank how well a candidate name matches a user-supplied query.
 *
 * Scoring tiers (higher = better match):
 *   100 — exact match after normalization
 *    80 — candidate starts with the query ("hdfc salary" → "HDFC Salary Account")
 *    70+ — every whitespace token of the query appears in the candidate
 *          (bonus grows with token count so multi-token hits beat single-token luck)
 *    60 — candidate merely contains the query as a substring
 *    10×n — only some query tokens matched (weak, may still win if nothing better)
 *   -1 — no match at all
 *
 * Returns a positive score when matched, -1 when not a match.
 */
export function scoreEntityMatch(name: string, query: string): number {
  const n = normalizeEntityName(name);
  const q = normalizeEntityName(query);
  if (!q || !n) return -1;
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 60;

  // Multi-token queries ("food dining") rarely substring-match, so score by
  // token coverage instead: all tokens present beats partial coverage.
  const qTokens = q.split(" ").filter(Boolean);
  if (qTokens.length > 1) {
    const matched = qTokens.filter((t) => n.includes(t)).length;
    if (matched === qTokens.length) return 70 + Math.min(qTokens.length, 5);
    return matched > 0 ? matched * 10 : -1;
  }
  return -1;
}

/**
 * Pick ALL candidates tied at the highest score for a fuzzy name query.
 *
 * Unlike {@link bestEntityMatch}, this never breaks ties silently — when the
 * user says "use SBI" and owns "SBI Savings" AND "SBI Salary", both tie at
 * the same tier, and the caller must ask for clarification instead of
 * guessing. Empty array when nothing matches.
 */
export function bestEntityMatches<T extends NamedEntity>(candidates: T[], query: string): T[] {
  let bestScore = 0;
  let best: T[] = [];
  for (const candidate of candidates) {
    const score = scoreEntityMatch(candidate.name, query);
    if (score <= 0) continue;
    if (score > bestScore) {
      bestScore = score;
      best = [candidate];
    } else if (score === bestScore) {
      best.push(candidate);
    }
  }
  return best;
}

/**
 * Pick the highest-scoring candidate for a fuzzy name query.
 * Ties and non-matches resolve to undefined — callers decide whether to
 * throw, ask the model, or auto-create. For accounts, prefer
 * {@link bestEntityMatches} so ties can be surfaced as ambiguous instead of
 * silently resolved to the first candidate.
 */
export function bestEntityMatch<T extends NamedEntity>(
  candidates: T[],
  query: string,
): T | undefined {
  return bestEntityMatches(candidates, query)[0];
}

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

export interface TransactionRefInput {
  account?: string;
  accountId?: string;
  category?: string;
  categoryId?: string;
  toAccount?: string;
  toAccountId?: string | null;
}

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

// ─── Soft reference check (for propose-time validation) ──────────────────────

export interface RefCheckWarning {
  field: string;
  message: string;
}

export interface TransactionRefCheckResult {
  ok: boolean;
  warnings: RefCheckWarning[];
  /** Filled with similar existing names for unresolved category references. */
  categorySuggestions: Record<string, string[]>;
}

/**
 * Non-throwing variant of {@link resolveTransactionRefs}. Used by the
 * propose-time `validate` hook to flag references that won't resolve (e.g. a
 * category name that doesn't exist yet) so the user sees a warning on the
 * confirm card instead of a hard failure after confirm.
 */
export async function checkTransactionRefs(
  accountsService: AccountsService,
  categoriesService: CategoriesService,
  userId: string,
  input: TransactionRefInput,
): Promise<TransactionRefCheckResult> {
  const warnings: RefCheckWarning[] = [];
  const categorySuggestions: Record<string, string[]> = {};
  const categories = await categoriesService.getCategories(userId);
  const accounts = await accountsService.findAll(userId);

  // Account
  const accountRef = splitRef(input.account) ?? { id: input.accountId ?? "" };
  if (accountRef.name) {
    const matches = bestEntityMatches(accounts, accountRef.name);
    if (matches.length > 1) {
      warnings.push({
        field: "Account",
        message: `Multiple accounts match "${accountRef.name}" (${matches
          .map((a) => a.name)
          .join(", ")}). Specify which account to use.`,
      });
    } else if (matches.length === 0) {
      warnings.push({
        field: "Account",
        message: `No account matches "${accountRef.name}".`,
      });
    }
  } else if (accountRef.id) {
    if (!accounts.find((a) => a.id === accountRef.id)) {
      warnings.push({ field: "Account", message: `Account ID ${accountRef.id} not found.` });
    }
  }

  // Category
  const categoryRef = splitRef(input.category) ?? { id: input.categoryId ?? "" };
  if (categoryRef.name) {
    const match = bestEntityMatch(categories, categoryRef.name);
    if (!match) {
      const similar = categories
        .map((c) => ({ name: c.name, score: scoreEntityMatch(c.name, categoryRef.name!) }))
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((m) => m.name);
      categorySuggestions[categoryRef.name] = similar;
      const suggestion = similar.length > 0 ? ` Similar: ${similar.join(", ")}.` : "";
      warnings.push({
        field: "Category",
        message: `No category matches "${categoryRef.name}".${suggestion} Confirming will create a new category.`,
      });
    }
  } else if (categoryRef.id) {
    if (!categories.find((c) => c.id === categoryRef.id)) {
      warnings.push({ field: "Category", message: `Category ID ${categoryRef.id} not found.` });
    }
  }

  // To-account (optional)
  if (input.toAccount !== undefined && input.toAccount !== null) {
    const toRef = splitRef(input.toAccount);
    if (toRef?.name) {
      const toMatches = bestEntityMatches(accounts, toRef.name);
      if (toMatches.length > 1) {
        warnings.push({
          field: "To account",
          message: `Multiple accounts match "${toRef.name}" (${toMatches
            .map((a) => a.name)
            .join(", ")}). Specify which account to use.`,
        });
      } else if (toMatches.length === 0) {
        warnings.push({
          field: "To account",
          message: `No account matches "${toRef.name}".`,
        });
      }
    }
  }

  return { ok: warnings.length === 0, warnings, categorySuggestions };
}

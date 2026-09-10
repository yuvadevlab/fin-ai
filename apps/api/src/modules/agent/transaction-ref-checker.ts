import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import {
  bestEntityMatch,
  bestEntityMatches,
  scoreEntityMatch,
  splitRef,
} from "./utils/entity-match.utils";

export interface TransactionRefInput {
  account?: string;
  accountId?: string;
  category?: string;
  categoryId?: string;
  toAccount?: string;
  toAccountId?: string | null;
}

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
 * Non-throwing variant of resolveTransactionRefs. Used by the
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

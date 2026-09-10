import { EntityMemory } from "./entity-memory";

/**
 * Pure helpers for extracting entity references from tool inputs and
 * serialized outputs. Kept side-effect-free so it can be unit tested and
 * reused across every tool without duplicating extraction logic.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Regex-based UUID check (RFC 4122 shape, case-insensitive). */
function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * Extract entity references from a tool's validated input.
 *
 * Only genuine UUIDs are recorded: free-text name fields ("HDFC account")
 * have no server-resolved id yet, and memorizing model-supplied strings as
 * ids would poison memory with hallucinated references. Name resolution is
 * the tool executor's job (it runs the resolve/search tools first).
 */
export function extractEntitiesFromInput(
  toolName: string,
  input: Record<string, unknown>,
): Partial<EntityMemory> {
  const delta: Partial<EntityMemory> = {};

  // Generic ID fields present across many tools.
  if (isUuid(input.accountId)) {
    delta.accounts = [
      { id: input.accountId, name: String(input.accountName ?? input.account ?? "") },
    ];
  }
  if (isUuid(input.categoryId)) {
    delta.categories = [
      { id: input.categoryId, name: String(input.categoryName ?? input.category ?? "") },
    ];
  }
  if (isUuid(input.budgetId)) {
    delta.budgets = [{ id: input.budgetId, name: String(input.budgetName ?? input.budget ?? "") }];
  }
  if (isUuid(input.goalId)) {
    delta.goals = [{ id: input.goalId, name: String(input.goalName ?? input.goal ?? "") }];
  }
  if (isUuid(input.investmentId)) {
    delta.investments = [
      { id: input.investmentId, name: String(input.investmentName ?? input.investment ?? "") },
    ];
  }
  if (isUuid(input.transactionId)) {
    delta.transactions = [
      {
        id: input.transactionId,
        label: String(
          input.transactionLabel ?? input.transaction ?? `Transaction ${input.transactionId}`,
        ),
      },
    ];
  }

  // Name-only references — can't extract without server resolution.
  // (handled by the tool executor, not here)

  return delta;
}

/** Extract entity refs from a tool's serialized output. */
export function extractEntitiesFromOutput(
  toolName: string,
  output: unknown,
): Partial<EntityMemory> {
  if (!output || typeof output !== "object") return {};
  const delta: Partial<EntityMemory> = {};
  const out = output as Record<string, unknown>;

  // accounts.list → { accounts: Account[] }
  if (Array.isArray(out.accounts)) {
    delta.accounts = (out.accounts as Record<string, unknown>[])
      .filter((a) => isUuid(a.id) && typeof a.name === "string")
      .map((a) => ({ id: a.id as string, name: a.name as string }));
  }

  // categories.list → { categories: Category[] }
  if (Array.isArray(out.categories)) {
    delta.categories = (out.categories as Record<string, unknown>[])
      .filter((c) => isUuid(c.id) && typeof c.name === "string")
      .map((c) => ({ id: c.id as string, name: c.name as string }));
  }

  // budgets.list → { budgets: Budget[] }
  if (Array.isArray(out.budgets)) {
    delta.budgets = (out.budgets as Record<string, unknown>[])
      .filter((b) => isUuid(b.id) && typeof b.name === "string")
      .map((b) => ({ id: b.id as string, name: b.name as string }));
  }

  // goals.list → { goals: Goal[] }
  if (Array.isArray(out.goals)) {
    delta.goals = (out.goals as Record<string, unknown>[])
      .filter((g) => isUuid(g.id) && typeof g.name === "string")
      .map((g) => ({ id: g.id as string, name: g.name as string }));
  }

  // investments.list → { investments: Investment[] }
  if (Array.isArray(out.investments)) {
    delta.investments = (out.investments as Record<string, unknown>[])
      .filter((i) => isUuid(i.id) && typeof i.name === "string")
      .map((i) => ({ id: i.id as string, name: i.name as string }));
  }

  // transactions.list → { transactions: Transaction[] }
  if (Array.isArray(out.transactions)) {
    delta.transactions = (out.transactions as Record<string, unknown>[])
      .filter((t) => isUuid(t.id))
      .map((t) => {
        const amount = typeof t.amount === "number" ? t.amount : 0;
        const type = String(t.type ?? "");
        const categoryName =
          t.category && typeof t.category === "object"
            ? ((t.category as Record<string, string>).name ?? "")
            : "";
        const dateStr = t.date ? String(t.date).slice(0, 10) : "";
        const label =
          `${type} ₹${amount}${categoryName ? ` · ${categoryName}` : ""}${dateStr ? ` · ${dateStr}` : ""}`.trim();
        return { id: t.id as string, label };
      });
  }

  // analytics.dashboard → may contain nested entities
  if (out.topCategories && Array.isArray(out.topCategories)) {
    // dashboard doesn't return IDs, skip — memory is for resolution.
  }

  // Single-entity create outputs (accounts.create → { id, name, ... })
  if (isUuid(out.id) && typeof out.name === "string") {
    // Determine kind from tool name prefix.
    if (toolName.startsWith("accounts.")) {
      delta.accounts = [{ id: out.id as string, name: out.name as string }];
    } else if (toolName.startsWith("categories.")) {
      delta.categories = [{ id: out.id as string, name: out.name as string }];
    } else if (toolName.startsWith("budgets.")) {
      delta.budgets = [{ id: out.id as string, name: out.name as string }];
    } else if (toolName.startsWith("goals.")) {
      delta.goals = [{ id: out.id as string, name: out.name as string }];
    } else if (toolName.startsWith("investments.")) {
      delta.investments = [{ id: out.id as string, name: out.name as string }];
    } else if (toolName.startsWith("transactions.")) {
      delta.transactions = [
        { id: out.id as string, label: (out.label as string) ?? `Transaction ${out.id}` },
      ];
    }
  }

  // transactions.summarize → may contain categoryId references
  if (Array.isArray(out.byCategory)) {
    delta.categories = (out.byCategory as Record<string, unknown>[])
      .filter((c) => isUuid(c.categoryId) && typeof c.categoryName === "string")
      .map((c) => ({ id: c.categoryId as string, name: c.categoryName as string }));
  }

  return delta;
}

import type { AgentCard } from "@finai/ai-engine";
import { formatINR } from "@finai/finance-engine";
import type { PrismaService } from "@/modules/prisma/prisma.service";

/**
 * Replaces raw UUIDs in a confirmation card's rows with the user-facing name
 * of the referenced entity (account, category, budget, goal, transaction,
 * investment). Lookups are scoped to the user, so IDs that don't belong to
 * the user are left as-is instead of leaking another user's data.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_LABEL_SUFFIX_RE = /\s+id$/i;

type EntityKind = "account" | "category" | "budget" | "goal" | "transaction" | "investment";

/**
 * Guess which entity kind a card row label refers to by keyword. Labels come
 * from tool `describe()` implementations ("Category id", "From account"), so
 * substring matching is intentionally loose to survive wording changes.
 */
function detectKind(label: string): EntityKind | null {
  const key = label.toLowerCase();
  if (key.includes("category")) return "category";
  if (key.includes("account")) return "account";
  if (key.includes("budget")) return "budget";
  if (key.includes("goal")) return "goal";
  if (key.includes("transaction")) return "transaction";
  if (key.includes("investment")) return "investment";
  return null;
}

/**
 * Humanize a confirmation card before it is shown to the user.
 *
 * Cards built from tool input contain raw UUIDs (e.g. "Account id:
 * 9a3f…"). This function scans the rows for UUID-shaped values, batches one
 * `findMany` per entity kind (single round-trip instead of N+1 per-row
 * lookups), and rewrites matching rows to display names — "HDFC Salary
 * Account" instead of an opaque id. Rows whose lookup fails (deleted or
 * foreign entity) keep the raw value rather than being dropped, so the
 * card always shows exactly what will be acted on.
 */
export async function enrichCardWithEntityNames(
  prisma: PrismaService,
  card: AgentCard,
  userId: string,
): Promise<AgentCard> {
  if (card.type !== "confirmation" || !card.rows || card.rows.length === 0) return card;

  const idsByKind = new Map<EntityKind, string[]>();
  const rowRefs: { index: number; kind: EntityKind; id: string }[] = [];

  card.rows.forEach(([label, value], index) => {
    if (!UUID_RE.test(value)) return;
    const kind = detectKind(label);
    if (!kind) return;
    if (!idsByKind.has(kind)) idsByKind.set(kind, []);
    idsByKind.get(kind)!.push(value);
    rowRefs.push({ index, kind, id: value });
  });

  if (rowRefs.length === 0) return card;

  // One batched query per entity kind (Promise.all runs them concurrently)
  // instead of a query per row — confirmation cards typically reference 2–4
  // entities and this keeps it at a handful of parallel round-trips.
  const accountIds = idsByKind.get("account");
  const categoryIds = idsByKind.get("category");
  const budgetIds = idsByKind.get("budget");
  const goalIds = idsByKind.get("goal");
  const transactionIds = idsByKind.get("transaction");
  const investmentIds = idsByKind.get("investment");

  const [accounts, categories, budgets, goals, transactions, investments] = await Promise.all([
    accountIds
      ? prisma.client.account.findMany({
          where: { id: { in: accountIds }, userId },
          select: { id: true, name: true },
        })
      : [],
    categoryIds
      ? prisma.client.category.findMany({
          where: { id: { in: categoryIds }, userId },
          select: { id: true, name: true },
        })
      : [],
    budgetIds
      ? prisma.client.budget.findMany({
          where: { id: { in: budgetIds }, userId },
          select: { id: true, category: { select: { name: true } }, limit: true },
        })
      : [],
    goalIds
      ? prisma.client.goal.findMany({
          where: { id: { in: goalIds }, userId },
          select: { id: true, name: true },
        })
      : [],
    transactionIds
      ? prisma.client.transaction.findMany({
          where: { id: { in: transactionIds }, userId },
          select: { id: true, type: true, amount: true },
        })
      : [],
    investmentIds
      ? prisma.client.investment.findMany({
          where: { id: { in: investmentIds }, userId },
          select: { id: true, name: true },
        })
      : [],
  ]);

  const names = new Map<string, string>();
  accounts.forEach((a) => names.set(a.id, a.name));
  categories.forEach((c) => names.set(c.id, c.name));
  // Budgets have no own name column — they're identified by their category.
  budgets.forEach((b) =>
    names.set(b.id, b.category?.name ? `Budget · ${b.category.name}` : "Budget"),
  );
  goals.forEach((g) => names.set(g.id, g.name));
  // Transactions are labelled by amount+type; a human-readable summary is
  // more useful here than the raw description field.
  transactions.forEach((t) => names.set(t.id, `Transaction · ${formatINR(t.amount)} ${t.type}`));
  investments.forEach((i) => names.set(i.id, i.name));

  const rows = card.rows.map(([label, value], index) => {
    const ref = rowRefs.find((r) => r.index === index);
    const cleanLabel = label.replace(ID_LABEL_SUFFIX_RE, "");
    if (!ref) return [label, value] as [string, string];
    return [cleanLabel, names.get(ref.id) ?? value] as [string, string];
  });

  return { ...card, rows };
}

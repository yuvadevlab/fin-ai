import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

/**
 * Entity memory: records accounts/categories/budgets/goals/investments/
 * transactions referenced during a conversation so follow-up questions
 * ("what's my balance?", "add ₹100 to that budget") can resolve ambiguous
 * references from prior context without the LLM re-guessing.
 *
 * Persisted as JSONB on Conversation.lastEntityRef. Scoped per conversation.
 */

/** Minimal id+name pair injected into entity memory. */
export interface EntityRef {
  id: string;
  name: string;
}

/** Transaction memory entry — uses a rich label because raw transaction rows have no single "name". */
export interface TransactionEntityRef {
  id: string;
  label: string; // human-readable: "₹250 EXPENSE · Groceries & Supermarket · 2026-09-05"
}

/** Per-kind entity lists remembered for one conversation. */
export interface EntityMemory {
  accounts: EntityRef[];
  categories: EntityRef[];
  budgets: EntityRef[];
  goals: EntityRef[];
  investments: EntityRef[];
  transactions: TransactionEntityRef[];
}

const EMPTY_MEMORY: EntityMemory = {
  accounts: [],
  categories: [],
  budgets: [],
  goals: [],
  investments: [],
  transactions: [],
};

/**
 * Keeps the first occurrence of each id (order-preserving dedupe). The first
 * sighting wins because it came from the most recent context the user asked
 * about; later duplicates would only repeat information.
 */
function dedupe<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

@Injectable()
export class EntityMemoryService {
  constructor(private prisma: PrismaService) {}

  /** Load entity memory for a conversation (returns empty if none). */
  async load(conversationId: string): Promise<EntityMemory> {
    const row = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId },
      select: { lastEntityRef: true },
    });
    if (!row?.lastEntityRef) return { ...EMPTY_MEMORY };
    const raw = row.lastEntityRef as Record<string, unknown>;
    return {
      accounts: (raw.accounts as EntityRef[]) ?? [],
      categories: (raw.categories as EntityRef[]) ?? [],
      budgets: (raw.budgets as EntityRef[]) ?? [],
      goals: (raw.goals as EntityRef[]) ?? [],
      investments: (raw.investments as EntityRef[]) ?? [],
      transactions: (raw.transactions as TransactionEntityRef[]) ?? [],
    };
  }

  /** Merge new entities into existing memory and persist. */
  async record(conversationId: string, delta: Partial<EntityMemory>): Promise<EntityMemory> {
    const current = await this.load(conversationId);
    const merged: EntityMemory = {
      accounts: dedupe([...current.accounts, ...(delta.accounts ?? [])]),
      categories: dedupe([...current.categories, ...(delta.categories ?? [])]),
      budgets: dedupe([...current.budgets, ...(delta.budgets ?? [])]),
      goals: dedupe([...current.goals, ...(delta.goals ?? [])]),
      investments: dedupe([...current.investments, ...(delta.investments ?? [])]),
      transactions: dedupe([...current.transactions, ...(delta.transactions ?? [])]),
    };
    // Cap each list to prevent unbounded growth.
    const CAP = 10;
    merged.accounts = merged.accounts.slice(-CAP);
    merged.categories = merged.categories.slice(-CAP);
    merged.budgets = merged.budgets.slice(-CAP);
    merged.goals = merged.goals.slice(-CAP);
    merged.investments = merged.investments.slice(-CAP);
    merged.transactions = merged.transactions.slice(-CAP);

    await this.prisma.client.conversation.update({
      where: { id: conversationId },
      data: { lastEntityRef: merged as object },
    });
    return merged;
  }

  /** Clear memory (e.g. when a conversation is reset). */
  async clear(conversationId: string): Promise<void> {
    await this.prisma.client.conversation.update({
      where: { id: conversationId },
      data: { lastEntityRef: null },
    });
  }

  /**
   * Build a prompt-Readable summary of current entity memory.
   * Returns an empty string when no memory exists so callers can
   * conditionally inject it.
   */
  buildPromptSection(memory: EntityMemory): string {
    const sections: string[] = [];

    if (memory.accounts.length > 0) {
      sections.push(
        "Accounts referenced in this conversation:\n" +
          memory.accounts.map((a) => `- ${a.name} (id: ${a.id})`).join("\n"),
      );
    }
    if (memory.categories.length > 0) {
      sections.push(
        "Categories referenced in this conversation:\n" +
          memory.categories.map((c) => `- ${c.name} (id: ${c.id})`).join("\n"),
      );
    }
    if (memory.budgets.length > 0) {
      sections.push(
        "Budgets referenced in this conversation:\n" +
          memory.budgets.map((b) => `- ${b.name} (id: ${b.id})`).join("\n"),
      );
    }
    if (memory.goals.length > 0) {
      sections.push(
        "Goals referenced in this conversation:\n" +
          memory.goals.map((g) => `- ${g.name} (id: ${g.id})`).join("\n"),
      );
    }
    if (memory.investments.length > 0) {
      sections.push(
        "Investments referenced in this conversation:\n" +
          memory.investments.map((i) => `- ${i.name} (id: ${i.id})`).join("\n"),
      );
    }
    if (memory.transactions.length > 0) {
      sections.push(
        "Transactions referenced in this conversation:\n" +
          memory.transactions.map((t) => `- ${t.label} (id: ${t.id})`).join("\n"),
      );
    }

    if (sections.length === 0) return "";
    return "## ENTITY MEMORY (referenced earlier in this conversation)\n" + sections.join("\n\n");
  }
}

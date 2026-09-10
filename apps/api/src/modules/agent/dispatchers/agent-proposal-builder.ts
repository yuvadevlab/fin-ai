import type { AgentCard } from "@finai/ai-engine";
import type { PrismaService } from "@/modules/prisma/prisma.service";
import type { ToolRegistry } from "../tool-registry";
import { enrichCardWithEntityNames } from "../card-enricher";

/**
 * Builds a human-readable confirmation card for the SSE stream with entity UUIDs
 * resolved to user-friendly names and warnings prepended.
 */
export async function buildConfirmationCard(
  registry: ToolRegistry,
  prisma: PrismaService,
  tool: string,
  input: unknown,
  userId: string,
  warnings: { field: string; message: string }[] = [],
): Promise<AgentCard> {
  const registered = registry.get(tool);
  let card: AgentCard;
  if (registered?.describe) {
    card = registered.describe(input);
  } else {
    card = {
      type: "confirmation",
      title: `Confirm: ${tool}`,
      rows: Object.entries((input ?? {}) as Record<string, unknown>).map(([key, value]) => [
        key,
        typeof value === "object" ? JSON.stringify(value) : String(value),
      ]),
    };
  }

  if (warnings.length > 0) {
    const warningRows: [string, string][] = warnings.map((w) => [`⚠️  ${w.field}`, w.message]);
    card = { ...card, rows: [...warningRows, ...card.rows] };
  }

  return enrichCardWithEntityNames(prisma, card, userId);
}

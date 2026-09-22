import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { AgentActionStatus, Prisma } from "@finai/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ToolRegistry } from "./tool-registry";
import { AuditService } from "./audit.service";
import type { AgentCard } from "@finai/ai-engine";

/**
 * How long a patched (unconfirmed) action stays valid. Matches the propose
 * TTL so a patched action doesn't outlive a fresh one.
 */
const ACTION_TTL_MINUTES = 15;

/**
 * Manages the lifecycle of pending (PROPOSED) agent actions beyond the basic
 * propose/confirm/reject flow: retrieving the active pending action for a
 * conversation, applying conversational patches, revalidating, and building
 * updated confirmation cards.
 *
 * A "pending action" is a PROPOSED row that hasn't been confirmed, rejected,
 * or expired. The conversation editing model treats this row as the source of
 * truth for the action the user is currently reviewing — the UI card is a
 * projection of this row, not an independent copy.
 */
@Injectable()
export class ActionManager {
  private readonly logger = new Logger(ActionManager.name);

  constructor(
    private prisma: PrismaService,
    private registry: ToolRegistry,
    private auditService: AuditService,
  ) {}

  /**
   * Get the most recent pending action for a conversation.
   *
   * Used at the start of a chat turn to detect whether the user's message
   * should be interpreted as a correction to an in-flight action. Returns
   * null when there is no pending action (normal chat flow).
   */
  async getPendingAction(conversationId: string, userId: string) {
    const pending = await this.prisma.client.agentAction.findFirst({
      where: {
        conversationId,
        userId,
        status: AgentActionStatus.PROPOSED,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (pending) {
      this.logger.debug(
        `[getPendingAction] Found pending "${pending.tool}" (${pending.id.slice(0, 8)}) in convo ${conversationId.slice(0, 8)}`,
      );
    }
    return pending;
  }

  /**
   * Apply a conversational patch to a pending action and revalidate.
   *
   * The patch is a partial update: only the fields present in `patch` are
   * merged into the existing input; all other fields are preserved unchanged.
   * The merged input is re-parsed through the tool's schema so an invalid
   * correction is caught immediately (the user sees the error instead of a
   * silent failure at confirm time).
   *
   * Safety checks:
   *   - ownership: action is looked up by id AND userId;
   *   - only PROPOSED actions can be patched (terminal states are immutable);
   *   - the merged input must pass schema validation.
   *
   * Returns the updated action + a fresh confirmation card. Does NOT execute
   * the action — it remains pending until the user explicitly confirms.
   */
  async patchAction(
    actionId: string,
    userId: string,
    patch: Record<string, unknown>,
  ): Promise<{ action: { id: string; tool: string; input: unknown }; card: AgentCard }> {
    this.logger.debug(
      `[patchAction] Patching action ${actionId.slice(0, 8)} for user ${userId.slice(0, 8)}: [${Object.keys(patch).join(", ")}]`,
    );
    const action = await this.prisma.client.agentAction.findFirst({
      where: { id: actionId, userId },
    });
    if (!action) {
      this.logger.warn(
        `[patchAction] Action ${actionId.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException("Agent action not found");
    }
    if (action.status !== AgentActionStatus.PROPOSED) {
      this.logger.warn(
        `[patchAction] Action ${actionId.slice(0, 8)} is ${action.status} — only pending actions can be edited`,
      );
      throw new BadRequestException(
        `Action is ${action.status} — only pending actions can be edited`,
      );
    }
    if (action.expiresAt <= new Date()) {
      this.logger.warn(`[patchAction] Action ${actionId.slice(0, 8)} expired — rejecting patch`);
      throw new BadRequestException("Action has expired — please start a new request");
    }

    const tool = this.registry.get(action.tool);
    if (!tool) {
      this.logger.warn(
        `[patchAction] Unknown tool on action ${actionId.slice(0, 8)}: "${action.tool}"`,
      );
      throw new BadRequestException(`Unknown tool: ${action.tool}`);
    }

    // Merge: patch fields override existing input; absent fields are preserved.
    const existingInput = action.input as Record<string, unknown>;
    const mergedInput = { ...existingInput, ...patch };

    // Re-parse through the schema so invalid corrections are caught now.
    const validated = tool.schema.parse(mergedInput);

    // Run propose-time validation to surface warnings on the updated card.
    const warnings: { field: string; message: string }[] = tool.validate
      ? await tool.validate(validated, { userId }).catch(() => [])
      : [];

    // Update the stored input + refresh the TTL so the action doesn't expire
    // while the user is still editing.
    const updated = await this.prisma.client.agentAction.update({
      where: { id: action.id },
      data: {
        input: validated as Prisma.InputJsonValue,
        expiresAt: new Date(Date.now() + ACTION_TTL_MINUTES * 60 * 1000),
      },
    });

    // Build the updated confirmation card.
    const card = await this.buildConfirmationCard(tool.name, validated, warnings);

    await this.auditService.record({
      userId,
      runId: action.id,
      action: "action.patch",
      tool: action.tool,
      status: "patched",
      metadata: { patchedFields: Object.keys(patch) },
    });

    this.logger.log(
      `Patched action "${action.tool}" (actionId: ${actionId.slice(0, 8)}, userId: ${userId.slice(0, 8)}) — fields: [${Object.keys(patch).join(", ")}], warnings: ${warnings.length}`,
    );
    return { action: { id: updated.id, tool: updated.tool, input: updated.input }, card };
  }

  /**
   * Build a human-readable confirmation card for a (possibly patched) action.
   * Mirrors AgentActionService.buildConfirmationCard but works standalone for
   * the patch flow without requiring a propose round-trip.
   */
  private async buildConfirmationCard(
    tool: string,
    input: unknown,
    warnings: { field: string; message: string }[] = [],
  ): Promise<AgentCard> {
    const registered = this.registry.get(tool);
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

    // Resolve entity UUIDs to names (reuse the existing enricher).
    const { enrichCardWithEntityNames } = await import("./card-enricher.js");
    return enrichCardWithEntityNames(
      this.prisma,
      card,
      (input as { userId?: string })?.userId ?? "",
    );
  }
}

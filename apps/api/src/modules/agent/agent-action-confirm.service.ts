import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@finai/logger";
import { AgentActionStatus, Prisma } from "@finai/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ToolRegistry } from "./tool-registry";
import { AuditService } from "./audit.service";
import type { AgentContext } from "./agent.types";

/**
 * Progress bookkeeping for partially-confirmed bulk actions. Stored in the
 * action row's `result` JSON column while status stays PROPOSED:
 *   { confirmedIndexes: number[], outputs: unknown[] }
 */
interface BulkProgress {
  confirmedIndexes: number[];
  outputs: unknown[];
}

function readProgress(result: Prisma.JsonValue | null): BulkProgress | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) return null;
  const idx = (result as Record<string, unknown>).confirmedIndexes;
  const outs = (result as Record<string, unknown>).outputs;
  if (!Array.isArray(idx)) return null;
  return { confirmedIndexes: idx.map(Number), outputs: Array.isArray(outs) ? outs : [] };
}

/**
 * Phase 2 of a confirmation-gated write action: the user said "yes".
 *
 * Extracted from AgentActionService (250-line rule) — owns the safety checks
 * (ownership, idempotency, state machine, expiry), execution, and audit trail
 * for both whole-action confirms and per-item bulk confirms.
 */
@Injectable()
export class AgentActionConfirmService {
  private readonly logger = new Logger(AgentActionConfirmService.name);

  constructor(
    private prisma: PrismaService,
    private registry: ToolRegistry,
    private auditService: AuditService,
  ) {}

  /**
   * Confirm the whole action. For bulk actions with partial per-item
   * progress, only the remaining (unconfirmed) items are executed.
   */
  async confirm(actionId: string, userId: string) {
    const action = await this.prisma.client.agentAction.findFirst({
      where: { id: actionId, userId },
    });
    if (!action) throw new NotFoundException("Agent action not found");
    if (action.status === AgentActionStatus.EXECUTED) {
      return { alreadyExecuted: true as const, result: action.result };
    }
    if (action.status !== AgentActionStatus.PROPOSED) {
      throw new BadRequestException(`Action is ${action.status}`);
    }
    await this.assertNotExpired(action.id, action.tool, action.expiresAt.getTime());

    const tool = this.requireTool(action.tool);
    const ctx: AgentContext = { userId, conversationId: action.conversationId, runId: action.id };
    const parsed = tool.schema.parse(action.input);

    // Bulk tool with prior per-item confirms → execute only the remainder.
    const progress = readProgress(action.result);
    if (progress && "transactions" in (parsed as object)) {
      const items = (parsed as { transactions: unknown[] }).transactions;
      const remaining = items.filter((_, i) => !progress.confirmedIndexes.includes(i));
      if (remaining.length === 0) {
        const updated = await this.markExecuted(action.id, action.result);
        return { alreadyExecuted: true as const, action: updated, result: action.result };
      }
      const output = await tool.execute({ transactions: remaining }, ctx);
      return this.finish(action, ctx, output);
    }

    const output = await tool.execute(parsed, ctx);
    return this.finish(action, ctx, output);
  }

  /**
   * Confirm a single item of a bulk action by its index. Executes just that
   * transaction via the single-item tool, records progress on the row, and
   * flips the action to EXECUTED once every item has been confirmed.
   */
  async confirmItem(actionId: string, userId: string, index: number) {
    const action = await this.prisma.client.agentAction.findFirst({
      where: { id: actionId, userId },
    });
    if (!action) throw new NotFoundException("Agent action not found");
    if (action.status !== AgentActionStatus.PROPOSED) {
      throw new BadRequestException(`Action is ${action.status}`);
    }
    await this.assertNotExpired(action.id, action.tool, action.expiresAt.getTime());

    const bulkTool = this.requireTool(action.tool);
    const singleTool = this.registry.get("transactions.create");
    if (!singleTool) throw new BadRequestException("Unknown tool: transactions.create");

    const parsed = bulkTool.schema.parse(action.input) as { transactions: unknown[] };
    if (index < 0 || index >= parsed.transactions.length) {
      throw new BadRequestException(
        `Index ${index} out of range (0-${parsed.transactions.length - 1})`,
      );
    }
    const progress = readProgress(action.result);
    if (progress?.confirmedIndexes.includes(index)) {
      return { alreadyConfirmed: true as const, done: false, ...progress }; // idempotent retry
    }

    const ctx: AgentContext = { userId, conversationId: action.conversationId, runId: action.id };
    const output = await singleTool.execute(parsed.transactions[index], ctx);

    const confirmedIndexes = [...(progress?.confirmedIndexes ?? []), index].sort((a, b) => a - b);
    const outputs = [...(progress?.outputs ?? []), output];
    const done = confirmedIndexes.length === parsed.transactions.length;

    const updated = await this.prisma.client.agentAction.update({
      where: { id: action.id },
      data: {
        result: { confirmedIndexes, outputs } as Prisma.InputJsonValue,
        ...(done && {
          status: AgentActionStatus.EXECUTED,
          executedAt: new Date(),
        }),
      },
    });
    await this.auditService.record({
      userId,
      runId: action.id,
      action: done ? "action.confirm" : "action.confirm-item",
      tool: action.tool,
      status: "success",
      metadata: { index, confirmed: confirmedIndexes.length, total: parsed.transactions.length },
    });
    this.logger.log(
      `Confirmed item ${index} of "${action.tool}" (actionId: ${action.id.slice(0, 8)}, ${confirmedIndexes.length}/${parsed.transactions.length}, userId: ${userId.slice(0, 8)})`,
    );
    return { alreadyConfirmed: false as const, done, action: updated, result: output };
  }

  private requireTool(name: string) {
    const tool = this.registry.get(name);
    if (!tool) throw new BadRequestException(`Unknown tool: ${name}`);
    return tool;
  }

  private async assertNotExpired(actionId: string, toolName: string, expiresAtMs: number) {
    if (expiresAtMs >= Date.now()) return;
    await this.prisma.client.agentAction.update({
      where: { id: actionId },
      data: { status: AgentActionStatus.EXPIRED },
    });
    this.logger.warn(
      `Action "${toolName}" (${actionId.slice(0, 8)}) expired at ${new Date(expiresAtMs).toISOString()}`,
    );
    throw new BadRequestException("Action confirmation expired");
  }

  private async markExecuted(actionId: string, result: Prisma.InputJsonValue | null) {
    return this.prisma.client.agentAction.update({
      where: { id: actionId },
      data: { status: AgentActionStatus.EXECUTED, result, executedAt: new Date() },
    });
  }

  /** Persist success, audit it, and return the controller payload. */
  private async finish(
    action: { id: string; tool: string; conversationId: string },
    _ctx: AgentContext,
    output: unknown,
  ) {
    const updated = await this.markExecuted(action.id, output as Prisma.InputJsonValue);
    await this.auditService.record({
      userId: _ctx.userId,
      runId: action.id,
      action: "action.confirm",
      tool: action.tool,
      status: "success",
      after: output,
    });
    this.logger.log(
      `Confirmed action "${action.tool}" (actionId: ${action.id.slice(0, 8)}, userId: ${_ctx.userId.slice(0, 8)}) — executed successfully`,
    );
    return { alreadyExecuted: false as const, action: updated, result: output };
  }
}

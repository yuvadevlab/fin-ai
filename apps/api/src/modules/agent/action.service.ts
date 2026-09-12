import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@finai/logger";
import { randomUUID } from "crypto";
import { AgentActionStatus, Prisma } from "@finai/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ToolRegistry } from "./tool-registry";
import { buildConfirmationCard as generateConfirmationCard } from "./dispatchers/agent-proposal-builder";
import { AuditService } from "./audit.service";
import type { AgentContext } from "./agent.types";
import type { AgentCard } from "@finai/ai-engine";

/**
 * How long a proposed (unconfirmed) action stays valid. A short TTL limits
 * the blast radius of stale proposals: if the user walks away, budgets and
 * balances may have changed by the time they return, so an old confirmation
 * could execute against data the user was no longer looking at. 15 minutes
 * is a compromise between convenience and staleness. Expired proposals are
 * flipped to EXPIRED lazily on confirm rather than via a cron job.
 */
const ACTION_TTL_MINUTES = 15;

export interface ProposeActionInput {
  /** Owning user — proposals are always scoped to one user. */
  userId: string;
  /** Conversation the proposal belongs to (shown in the UI thread). */
  conversationId: string;
  /** Registry name of the confirmation-gated tool, e.g. "transactions.create". */
  tool: string;
  /** Tool input as produced by the model (validated again here). */
  input: unknown;
  /** Agent run that produced the proposal, for audit correlation. */
  runId?: string;
}

/**
 * Two-phase execution for confirmation-gated tools:
 * propose (PROPOSED row, idempotency key, expiry) → user confirms → execute.
 */
@Injectable()
export class AgentActionService {
  private readonly logger = new Logger(AgentActionService.name);

  constructor(
    private prisma: PrismaService,
    private registry: ToolRegistry,
    private auditService: AuditService,
  ) {}

  /**
   * Phase 1 of a write action: store a PROPOSED row without executing.
   *
   * Called by the agent loop when the model selects a confirmation-gated
   * tool. The input is validated immediately so an unparseable proposal can
   * never sit in the database waiting to fail at confirm time. A fresh
   * `clientActionId` is generated to make confirmation idempotent against
   * double-clicks/retries on the client, and the TTL is stamped so stale
   * proposals self-retire.
   */
  async propose(input: ProposeActionInput) {
    this.logger.debug(
      `[propose] Proposing action "${input.tool}" for user ${input.userId.slice(0, 8)} (run: ${(input.runId ?? "").slice(0, 8) || "n/a"})`,
    );
    const tool = this.registry.get(input.tool);
    if (!tool) {
      this.logger.warn(
        `[propose] Unknown tool requested: "${input.tool}" (user: ${input.userId.slice(0, 8)})`,
      );
      throw new BadRequestException(`Unknown tool: ${input.tool}`);
    }
    if (tool.confirmation !== "required") {
      this.logger.warn(
        `[propose] Tool "${input.tool}" does not require confirmation — rejecting proposal`,
      );
      throw new BadRequestException(`Tool ${input.tool} does not require confirmation`);
    }

    // Validate now so a confirmed action can never carry invalid input.
    const validated = tool.schema.parse(input.input);

    return this.prisma.client.agentAction
      .create({
        data: {
          clientActionId: randomUUID(),
          conversationId: input.conversationId,
          userId: input.userId,
          tool: input.tool,
          input: validated as Prisma.InputJsonValue,
          expiresAt: new Date(Date.now() + ACTION_TTL_MINUTES * 60 * 1000),
        },
      })
      .then((action) => {
        this.logger.log(
          `Proposed action "${input.tool}" (actionId: ${action.id}, userId: ${input.userId.slice(0, 8)}, runId: ${(input.runId ?? "").slice(0, 8)})`,
        );
        return action;
      });
  }

  /**
   * Phase 2 of a write action: user said "yes" — execute the stored tool.
   *
   * Safety checks, in order:
   *   - ownership: the action row is looked up by id AND userId, so one
   *     user can never confirm another user's proposal;
   *   - idempotency: re-confirming an already-executed action returns the
   *     original result instead of executing twice (network retries);
   *   - state machine: only PROPOSED actions can transition to EXECUTED;
   *   - expiry: stale proposals are marked EXPIRED and refused.
   *
   * The input is re-validated (schema may have changed between propose and
   * confirm during a deploy) and the tool executes with the confirming
   * user's identity. Success/failure is persisted on the row and audited
   * with an after-image; on failure the row becomes FAILED and the error is
   * rethrown so the controller returns a non-2xx status.
   */
  async confirm(actionId: string, userId: string) {
    const action = await this.prisma.client.agentAction.findFirst({
      where: { id: actionId, userId },
    });
    if (!action) {
      throw new NotFoundException("Agent action not found");
    }

    // Idempotency: re-confirming an executed action returns the original result.
    if (action.status === AgentActionStatus.EXECUTED) {
      return { alreadyExecuted: true as const, result: action.result };
    }
    if (action.status !== AgentActionStatus.PROPOSED) {
      throw new BadRequestException(`Action is ${action.status}`);
    }
    if (action.expiresAt.getTime() < Date.now()) {
      await this.prisma.client.agentAction.update({
        where: { id: action.id },
        data: { status: AgentActionStatus.EXPIRED },
      });
      this.logger.warn(
        `Action "${action.tool}" (${actionId.slice(0, 8)}) expired at ${action.expiresAt.toISOString()}`,
      );
      throw new BadRequestException("Action confirmation expired");
    }

    const tool = this.registry.get(action.tool);
    if (!tool) {
      throw new BadRequestException(`Unknown tool: ${action.tool}`);
    }

    const parsed = tool.schema.parse(action.input);
    const ctx: AgentContext = {
      userId,
      conversationId: action.conversationId,
      runId: action.id,
    };

    try {
      const output = await tool.execute(parsed, ctx);
      const updated = await this.prisma.client.agentAction.update({
        where: { id: action.id },
        data: {
          status: AgentActionStatus.EXECUTED,
          result: output as Prisma.InputJsonValue,
          executedAt: new Date(),
        },
      });
      await this.auditService.record({
        userId,
        runId: action.id,
        action: "action.confirm",
        tool: action.tool,
        status: "success",
        after: output,
      });
      this.logger.log(
        `Confirmed action "${action.tool}" (actionId: ${action.id.slice(0, 8)}, userId: ${userId.slice(0, 8)}) — executed successfully`,
      );
      return { alreadyExecuted: false as const, action: updated, result: output };
    } catch (error) {
      await this.prisma.client.agentAction.update({
        where: { id: action.id },
        data: {
          status: AgentActionStatus.FAILED,
          error: (error as Error).message,
        },
      });
      await this.auditService.record({
        userId,
        runId: action.id,
        action: "action.confirm",
        tool: action.tool,
        status: "error",
        metadata: { error: (error as Error).message },
      });
      this.logger.error(
        `Failed to execute confirmed action "${action.tool}" (actionId: ${action.id.slice(0, 8)}, userId: ${userId.slice(0, 8)}): ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Phase 2 alternative: user said "no" — mark the proposal REJECTED.
   * Only PROPOSED rows can be rejected; terminal states (EXECUTED/FAILED/
   * EXPIRED) are immutable so history cannot be rewritten.
   */
  async reject(actionId: string, userId: string) {
    this.logger.info(
      `[reject] Rejecting action ${actionId.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const action = await this.prisma.client.agentAction.findFirst({
      where: { id: actionId, userId },
    });
    if (!action) {
      this.logger.warn(
        `[reject] Action ${actionId.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException("Agent action not found");
    }
    if (action.status !== AgentActionStatus.PROPOSED) {
      this.logger.warn(
        `[reject] Action ${actionId.slice(0, 8)} is ${action.status} — cannot reject`,
      );
      throw new BadRequestException(`Action is ${action.status}`);
    }

    const updated = await this.prisma.client.agentAction.update({
      where: { id: action.id },
      data: { status: AgentActionStatus.REJECTED },
    });
    await this.auditService.record({
      userId,
      runId: action.id,
      action: "action.reject",
      tool: action.tool,
      status: "rejected",
    });
    this.logger.log(
      `Rejected action "${action.tool}" (actionId: ${actionId.slice(0, 8)}, userId: ${userId.slice(0, 8)})`,
    );
    return { rejected: true as const, action: updated };
  }

  /**
   * Pending (unexpired, unconfirmed) proposals for the user, newest first.
   * Used to rehydrate confirmation cards after a page reload — without this
   * a refresh would strand a proposed action with no way to confirm it.
   */
  async listProposed(userId: string, conversationId?: string) {
    this.logger.debug(
      `[listProposed] Listing pending actions for user ${userId.slice(0, 8)}${conversationId ? ` (convo: ${conversationId.slice(0, 8)})` : ""}`,
    );
    return this.prisma.client.agentAction.findMany({
      where: {
        userId,
        status: AgentActionStatus.PROPOSED,
        expiresAt: { gt: new Date() },
        ...(conversationId && { conversationId }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Human-readable confirmation card for the SSE stream (IDs resolved to names).
   */
  async buildConfirmationCard(
    tool: string,
    input: unknown,
    userId: string,
    warnings: { field: string; message: string }[] = [],
  ): Promise<AgentCard> {
    return generateConfirmationCard(this.registry, this.prisma, tool, input, userId, warnings);
  }
}

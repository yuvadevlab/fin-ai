import { BadRequestException, Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { randomUUID } from "crypto";
import { Prisma } from "@finai/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ToolRegistry } from "./tool-registry";
import { buildConfirmationCard as generateConfirmationCard } from "./dispatchers/agent-proposal-builder";
import { AuditService } from "./audit.service";
import { executeActionConfirm } from "./action-execution.helper";
import {
  rejectAgentAction,
  listProposedActions,
  listActionsByConversation,
} from "./action-query.helper";
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
  /**
   * Phase 2 of a write action: user said "yes" — execute the stored tool.
   */
  async confirm(actionId: string, userId: string, options?: { itemIndex?: number }) {
    return executeActionConfirm(
      this.prisma,
      this.registry,
      this.auditService,
      this.logger,
      actionId,
      userId,
      options,
    );
  }

  /**
   * Phase 2 alternative: user said "no" — mark the proposal REJECTED.
   * Only PROPOSED rows can be rejected; terminal states (EXECUTED/FAILED/
   * EXPIRED) are immutable so history cannot be rewritten.
   */
  async reject(actionId: string, userId: string, options?: { itemIndex?: number }) {
    return rejectAgentAction(
      this.prisma,
      this.auditService,
      this.logger,
      actionId,
      userId,
      options,
    );
  }

  /**
   * Pending (unexpired, unconfirmed) proposals for the user, newest first.
   * Used to rehydrate confirmation cards after a page reload.
   */
  async listProposed(userId: string, conversationId?: string) {
    return listProposedActions(this.prisma, this.logger, userId, conversationId);
  }

  /**
   * Lists all agent actions for a conversation, including createdAt timestamp.
   */
  async listByConversation(userId: string, conversationId: string) {
    return listActionsByConversation(
      this.prisma,
      (tool, input, uid) => this.buildConfirmationCard(tool, input, uid),
      userId,
      conversationId,
    );
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

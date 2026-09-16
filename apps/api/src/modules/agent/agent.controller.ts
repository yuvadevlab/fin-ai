import { Body, Controller, Get, Post, Param, Query, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { type Response } from "express";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { agentChatSchema, type AgentChatInput } from "@finai/validation";
import { AgentService } from "./agent.service";
import { AgentActionService } from "./action.service";
import { Logger } from "@finai/logger";
import type { AgentEventEmitter } from "./agent.types";

/**
 * HTTP entry points for the agent experience.
 *
 * `POST /agent/chat` streams the agent run to the browser as Server-Sent
 * Events (SSE) — the same connection carries text tokens, tool progress,
 * confirmation cards, and the terminal `done` event. The confirm/reject
 * endpoints complete the two-phase write flow started when the agent
 * proposed an action (see `AgentActionService`).
 *
 * Rate limiting (ThrottlerGuard) exists because every chat request spawns
 * up to MAX_ITERATIONS local LLM calls, which is expensive.
 */
@ApiTags("Agent")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Controller("agent")
export class AgentController {
  private readonly logger = new Logger(AgentController.name);
  constructor(
    private readonly agentService: AgentService,
    private readonly actionService: AgentActionService,
  ) {}

  /**
   * Starts (or continues) an agent run and streams it to the client via SSE.
   *
   * NestJS normally serializes controller return values, so the response
   * object is injected here to take over the raw HTTP stream: SSE headers
   * are set, and every `emit` callback writes one `data:` frame. The
   * controller owns only transport concerns — all agent logic, error
   * handling, and event ordering live in `AgentService.chat`. The try/catch
   * guarantees an `error` + `done` event pair even if the service throws
   * unexpectedly, so the client never sees a silently dropped stream.
   */
  @Post("chat")
  @ApiOperation({ summary: "Run an agent turn and stream events via SSE" })
  async chat(
    @Body(new ZodValidationPipe(agentChatSchema)) body: AgentChatInput,
    @CurrentUser("id") userId: string,
    @Res() res: Response,
  ) {
    this.logger.info(
      `[POST /agent/chat] SSE stream started for user ${userId.slice(0, 8)}: "${body.question.slice(0, 50)}" (convo: ${(body.conversationId ?? "").slice(0, 8) || "new"})`,
    );
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const emit: AgentEventEmitter = (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      await this.agentService.chat(body, userId, emit);
      this.logger.debug(`[POST /agent/chat] SSE stream completed for user ${userId.slice(0, 8)}`);
    } catch (error) {
      this.logger.error(
        `[POST /agent/chat] Stream failed for user ${userId.slice(0, 8)}: ${(error as Error).message}`,
      );
      emit({ type: "error", error: (error as Error).message || "Agent failure" });
      emit({ type: "done" });
    } finally {
      res.end();
    }
  }

  @Post("actions/:id/confirm")
  @ApiOperation({
    summary: "Confirm and execute a proposed agent action (optionally for a specific item)",
  })
  confirm(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body?: { itemIndex?: number },
  ) {
    this.logger.info(
      `[POST /agent/actions/:id/confirm] Confirming action ${id.slice(0, 8)} for user ${userId.slice(0, 8)}${body?.itemIndex !== undefined ? ` (item ${body.itemIndex})` : ""}`,
    );
    return this.actionService.confirm(id, userId, body);
  }

  @Post("actions/:id/reject")
  @ApiOperation({ summary: "Reject a proposed agent action (optionally for a specific item)" })
  reject(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body?: { itemIndex?: number },
  ) {
    this.logger.info(
      `[POST /agent/actions/:id/reject] Rejecting action ${id.slice(0, 8)} for user ${userId.slice(0, 8)}${body?.itemIndex !== undefined ? ` (item ${body.itemIndex})` : ""}`,
    );
    return this.actionService.reject(id, userId, body);
  }

  @Get("actions/proposed")
  @ApiOperation({ summary: "List pending agent actions awaiting confirmation" })
  listProposed(
    @CurrentUser("id") userId: string,
    @Query("conversationId") conversationId?: string,
  ) {
    this.logger.debug(
      `[GET /agent/actions/proposed] Listing pending actions for user ${userId.slice(0, 8)}${conversationId ? ` (convo: ${conversationId.slice(0, 8)})` : ""}`,
    );
    return this.actionService.listProposed(userId, conversationId);
  }

  @Get("actions/history")
  @ApiOperation({ summary: "List all agent actions (any status) for a conversation" })
  listByConversation(
    @CurrentUser("id") userId: string,
    @Query("conversationId") conversationId: string,
  ) {
    this.logger.debug(
      `[GET /agent/actions/history] Listing all actions for user ${userId.slice(0, 8)} convo ${(conversationId ?? "").slice(0, 8)}`,
    );
    return this.actionService.listByConversation(userId, conversationId);
  }
}

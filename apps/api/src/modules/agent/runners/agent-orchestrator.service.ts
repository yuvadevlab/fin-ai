import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { Prisma } from "@fin-ai/database";
import { AgentRunLogLevel } from "@fin-ai/shared-types";
import {
  parseToolPlan,
  stripToolPlanTags,
  formatActionProposalMessage,
  AGENT_PROPOSAL_FAILED_MESSAGE,
  AGENT_MAX_ITERATIONS_MESSAGE,
  type LlmChatRequest,
  type AiProviderRole,
} from "@fin-ai/ai-engine";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ConversationService } from "@/modules/ai/conversation.service";
import { AgentModelFactory } from "./agent-model.factory";
import { AgentTurnRunner } from "./agent-turn.runner";
import { AgentToolDispatcher } from "../dispatchers";
import type { AgentEventEmitter } from "../agent.types";
import {
  EMPTY_RESPONSE_FALLBACK_MESSAGE,
  EMPTY_TURN_RECOVERY_PROMPT,
  MAX_EMPTY_RETRIES,
  MAX_ITERATIONS,
  emitModelTurnEnd,
  emitMaxIterationsError,
  emitRunLog,
  executeToolBatch,
} from "./agent-orchestrator.helpers";

export interface AgentRunParams {
  userId: string;
  conversationId: string;
  runId: string;
  request: LlmChatRequest;
  hasPendingAction: boolean;
  emit: AgentEventEmitter;
  role?: AiProviderRole;
  workspaceId?: string;
  memberUserIds?: string[];
  isWorkspaceReadOnly?: boolean;
}

/**
 * Orchestrates multi-turn ReAct execution loop for an agent session.
 * Coordinates between the LLM model, AgentTurnRunner, and AgentToolDispatcher.
 */
@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
    private readonly modelFactory: AgentModelFactory,
    private readonly turnRunner: AgentTurnRunner,
    private readonly toolDispatcher: AgentToolDispatcher,
  ) {}

  /**
   * Runs the MAX_ITERATIONS ReAct loop; returns when answer/confirmation/error is emitted.
   */
  async run({
    userId,
    conversationId,
    runId,
    request,
    hasPendingAction,
    emit,
    role,
    workspaceId,
    memberUserIds,
    isWorkspaceReadOnly,
  }: AgentRunParams): Promise<void> {
    const model = this.modelFactory.create(role ?? "agent");
    this.logger.info(
      `[Run ${runId.slice(0, 8)}] Started (role: ${role ?? "agent"}, provider: ${model.provider}, model: ${model.model})`,
    );
    emitRunLog(
      emit,
      AgentRunLogLevel.SYS,
      `Initialized ${model.provider} (${model.model})`,
      `role=${role ?? "agent"}`,
    );
    let tokensIn = 0;
    let tokensOut = 0;
    let runVisibleContent = "";
    let emptyRetries = 0;

    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
      this.logger.info(
        `[Run ${runId.slice(0, 8)}] Turn ${iteration}/${MAX_ITERATIONS} evaluating...`,
      );
      const turn = await this.turnRunner.run(model, request, emit, iteration, hasPendingAction);
      tokensIn += turn.tokensIn;
      tokensOut += turn.tokensOut;
      runVisibleContent += stripToolPlanTags(turn.visibleContent);

      const toolCalls =
        turn.toolCalls.length > 0 ? turn.toolCalls : (parseToolPlan(turn.rawContent) ?? []);

      this.logger.info(
        `[Run ${runId.slice(0, 8)}] Turn ${iteration} completed (${toolCalls.length} tool calls, tokens: +${turn.tokensIn} in / +${turn.tokensOut} out)`,
      );

      emitModelTurnEnd(emit, iteration, hasPendingAction, toolCalls.length);

      if (toolCalls.length === 0) {
        let finalContent = stripToolPlanTags(runVisibleContent).trim();

        // Recover when model emitted empty text or only planning tags (e.g. </tool_plan>)
        if (!finalContent && emptyRetries < MAX_EMPTY_RETRIES && iteration < MAX_ITERATIONS) {
          emptyRetries++;
          this.logger.warn(
            `[Run ${runId.slice(0, 8)}] Empty or malformed-plan turn on iteration ${iteration}; retrying (${emptyRetries}/${MAX_EMPTY_RETRIES})`,
          );
          const retryMsg = `Empty/malformed output on turn ${iteration} — retrying (${emptyRetries}/${MAX_EMPTY_RETRIES})`;
          emitRunLog(emit, AgentRunLogLevel.LLM, retryMsg);
          request.messages.push({ role: "user", content: EMPTY_TURN_RECOVERY_PROMPT });
          continue;
        }

        if (!finalContent) {
          finalContent = EMPTY_RESPONSE_FALLBACK_MESSAGE;
          emit({ type: "token_replace", content: finalContent });
        } else if (!hasPendingAction && /confirmation card/i.test(finalContent)) {
          finalContent = AGENT_PROPOSAL_FAILED_MESSAGE;
          emit({ type: "token_replace", content: finalContent });
        }
        await this.finishRun(
          conversationId,
          model.model,
          runId,
          iteration,
          finalContent,
          tokensIn,
          tokensOut,
          emit,
        );
        return;
      }

      request.messages.push({ role: "assistant", content: turn.rawContent });
      let hasConfirmation = false;
      let confirmationCount = 0;

      const dispatchOne = async (call: (typeof toolCalls)[number]) => {
        this.logger.info(
          `[Run ${runId.slice(0, 8)}] Dispatching tool "${call.name}" args: ${call.arguments.slice(0, 80)}`,
        );
        emitRunLog(
          emit,
          AgentRunLogLevel.TOOL,
          `Dispatching ${call.name}`,
          call.arguments.slice(0, 80),
        );
        const result = await this.toolDispatcher.dispatch(
          call,
          { userId, conversationId, runId, workspaceId, memberUserIds, isWorkspaceReadOnly },
          emit,
        );
        this.logger.info(
          `[Run ${runId.slice(0, 8)}] Tool "${call.name}" status: ${(result as { status?: string }).status ?? "ok"}`,
        );
        return { call, result };
      };

      const dispatched = await executeToolBatch(
        toolCalls,
        (name) => this.toolDispatcher.isReadOnly?.(name) ?? false,
        emit,
        dispatchOne,
      );

      for (const { call, result } of dispatched) {
        request.messages.push({
          role: "tool",
          toolName: call.name,
          content: `<tool_result tool="${call.name}">${JSON.stringify(result)}</tool_result>`,
        });

        if ((result as { status?: string }).status === "awaiting_confirmation") {
          hasConfirmation = true;
          confirmationCount++;
        }
      }

      if (hasConfirmation) {
        const msg = formatActionProposalMessage(confirmationCount);
        emit({ type: "token_replace", content: msg });
        await this.finishRun(
          conversationId,
          model.model,
          runId,
          iteration,
          msg,
          tokensIn,
          tokensOut,
          emit,
        );
        return;
      }
    }

    try {
      this.logger.info(
        `[Run ${runId.slice(0, 8)}] Max turns reached — generating final synthesis...`,
      );
      request.messages.push({
        role: "user",
        content:
          "Please provide your final answer and recommendations based on the data retrieved above.",
      });
      const finalTurn = await this.turnRunner.run(
        model,
        { ...request, tools: undefined },
        emit,
        MAX_ITERATIONS + 1,
        hasPendingAction,
      );
      if (finalTurn.visibleContent.trim()) {
        await this.finishRun(
          conversationId,
          model.model,
          runId,
          MAX_ITERATIONS + 1,
          finalTurn.visibleContent,
          tokensIn + finalTurn.tokensIn,
          tokensOut + finalTurn.tokensOut,
          emit,
        );
        return;
      }
    } catch (finalError) {
      this.logger.error(`[Run ${runId.slice(0, 8)}] Final synthesis failed`, finalError);
    }

    emitMaxIterationsError(emit, AGENT_MAX_ITERATIONS_MESSAGE);
  }

  /** Persists the final assistant message and closes the run with a `done` event. */
  private async finishRun(
    conversationId: string,
    modelName: string,
    runId: string,
    iterations: number,
    finalContent: string,
    tokensIn: number,
    tokensOut: number,
    emit: AgentEventEmitter,
  ): Promise<void> {
    this.logger.info(
      `[Run ${runId.slice(0, 8)}] Complete (${iterations} turn(s), model: ${modelName}, tokens: ${tokensIn} in / ${tokensOut} out)`,
    );
    const message = await this.conversationService.addMessage(
      conversationId,
      "assistant",
      finalContent,
    );

    await this.prisma.client.message.update({
      where: { id: message.id },
      data: {
        metadata: {
          runId,
          model: modelName,
          iterations,
          tokensIn,
          tokensOut,
        } as Prisma.InputJsonValue,
      },
    });

    if (tokensIn || tokensOut) {
      emit({ type: "usage", tokensIn, tokensOut });
    }
    emit({ type: "done" });
  }
}

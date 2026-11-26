import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import {
  AgentRunLogLevel,
  AgentStreamEventType,
  ExecutionPhase,
  LlmStreamEventType,
  PhaseStatus,
} from "@fin-ai/shared-types";
import {
  ToolPlanStreamFilter,
  type ChatModel,
  type LlmChatRequest,
  type LlmToolCall,
} from "@fin-ai/ai-engine";
import type { AgentEventEmitter } from "../agent.types";

export interface ModelTurnResult {
  /** Full model output including <tool_plan> blocks — used for message history replay. */
  rawContent: string;
  /** Tool-plan-filtered output — exactly what the user saw streamed. */
  visibleContent: string;
  /** Tool calls surfaced by native function calling (may be empty). */
  toolCalls: LlmToolCall[];
  /** Prompt token count reported by Ollama (0 when unknown). */
  tokensIn: number;
  /** Generated token count reported by Ollama (0 when unknown). */
  tokensOut: number;
}

/**
 * Executes a single model streaming turn and reduces the event stream into a
 * structured `ModelTurnResult`. Handles ToolPlanStreamFilter so <tool_plan>
 * blocks are hidden from the user while rawContent retains them for fallback
 * parsing.
 */
@Injectable()
export class AgentTurnRunner {
  private readonly logger = new Logger(AgentTurnRunner.name);

  /**
   * @param model  LLM client to stream from
   * @param request Accumulated message history + tools
   * @param emit   SSE emitter for live token streaming
   * @param turn   1-based iteration number (for phase events)
   * @param pendingAction Whether a confirmation is pending this turn
   */
  async run(
    model: ChatModel,
    request: LlmChatRequest,
    emit: AgentEventEmitter,
    turn: number,
    pendingAction: boolean,
  ): Promise<ModelTurnResult> {
    this.logger.info(
      `Turn ${turn}: streaming (${request.messages.length} msgs, ${request.tools?.length ?? 0} tools, pendingAction: ${pendingAction})`,
    );
    emit({
      type: AgentStreamEventType.PHASE,
      phase: ExecutionPhase.MODEL_TURN,
      status: PhaseStatus.START,
      turn,
      pendingAction,
    });

    const filter = new ToolPlanStreamFilter();
    const reasoningFilter = new ToolPlanStreamFilter();
    let reasoningContent = "";
    let deltaContent = "";
    let visibleContent = "";
    let tokensIn = 0;
    let tokensOut = 0;
    const toolCalls: LlmToolCall[] = [];

    for await (const event of model.stream(request)) {
      switch (event.type) {
        case LlmStreamEventType.REASONING_DELTA: {
          // Stream sanitized thinking live to the UI while preserving full
          // reasoningContent for <tool_plan> fallback parsing.
          reasoningContent += event.text;
          const visibleReasoning = reasoningFilter.push(event.text);
          if (visibleReasoning) {
            emit({ type: AgentStreamEventType.REASONING, content: visibleReasoning });
          }
          break;
        }
        case LlmStreamEventType.TEXT_DELTA: {
          deltaContent += event.text;
          const visible = filter.push(event.text);
          if (visible) {
            visibleContent += visible;
            emit({ type: AgentStreamEventType.TOKEN, content: visible });
          }
          break;
        }
        case LlmStreamEventType.TOOL_CALL:
          toolCalls.push(event.toolCall);
          break;
        case LlmStreamEventType.USAGE:
          tokensIn = event.tokensIn;
          tokensOut = event.tokensOut;
          break;
        case LlmStreamEventType.DONE:
          break;
      }
    }

    // Flush any partial-tag tail held by the filters
    const reasoningTail = reasoningFilter.flush();
    if (reasoningTail) {
      emit({ type: AgentStreamEventType.REASONING, content: reasoningTail });
    }
    const tail = filter.flush();
    if (tail) {
      visibleContent += tail;
      emit({ type: AgentStreamEventType.TOKEN, content: tail });
    }

    // Reconstruct full raw output across reasoning + content channels so split
    // <tool_plan>{...}</tool_plan> blocks parse cleanly.
    const rawContent = reasoningContent ? `${reasoningContent}${deltaContent}` : deltaContent;

    this.logger.info(
      `Turn ${turn}: done — ${visibleContent.length} visible chars (${reasoningContent.length} reasoning chars), ${toolCalls.length} native tool call(s), tokens: ${tokensIn} in / ${tokensOut} out`,
    );
    emit({
      type: AgentStreamEventType.LOG,
      level: AgentRunLogLevel.LLM,
      message: `Turn ${turn} inference complete`,
      detail: `${visibleContent.length} visible chars${reasoningContent ? `, ${reasoningContent.length} reasoning chars` : ""}`,
    });
    return { rawContent, visibleContent, toolCalls, tokensIn, tokensOut };
  }
}

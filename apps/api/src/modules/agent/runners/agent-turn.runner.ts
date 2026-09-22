import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import {
  ToolPlanStreamFilter,
  type ChatModel,
  type LlmChatRequest,
  type LlmToolCall,
} from "@finai/ai-engine";
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
    this.logger.log(
      `Turn ${turn}: streaming (${request.messages.length} msgs, ${request.tools?.length ?? 0} tools, pendingAction: ${pendingAction})`,
    );
    emit({ type: "phase", phase: "model_turn", status: "start", turn, pendingAction });

    const filter = new ToolPlanStreamFilter();
    let rawContent = "";
    let visibleContent = "";
    let tokensIn = 0;
    let tokensOut = 0;
    const toolCalls: LlmToolCall[] = [];

    for await (const event of model.stream(request)) {
      switch (event.type) {
        case "text-delta": {
          rawContent += event.text;
          const visible = filter.push(event.text);
          if (visible) {
            visibleContent += visible;
            emit({ type: "token", content: visible });
          }
          break;
        }
        case "tool_call":
          toolCalls.push(event.toolCall);
          break;
        case "usage":
          tokensIn = event.tokensIn;
          tokensOut = event.tokensOut;
          break;
        case "done":
          break;
      }
    }

    // Flush any partial-tag tail held by the filter
    const tail = filter.flush();
    if (tail) {
      visibleContent += tail;
      emit({ type: "token", content: tail });
    }

    this.logger.log(
      `Turn ${turn}: done — ${visibleContent.length} visible chars, ${toolCalls.length} native tool call(s), tokens: ${tokensIn} in / ${tokensOut} out`,
    );
    return { rawContent, visibleContent, toolCalls, tokensIn, tokensOut };
  }
}

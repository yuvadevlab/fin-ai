import {
  AgentErrorCode,
  AgentRunLogLevel,
  AgentStreamEventType,
  ExecutionPhase,
  PhaseStatus,
} from "@fin-ai/shared-types";
import type { LlmToolCall } from "@fin-ai/ai-engine";
import type { AgentEventEmitter } from "../agent.types";

/** Safety cap: max model↔tool loop iterations per run. */
export const MAX_ITERATIONS = 8;

/** Max corrective retries when the model returns empty or tag-only output. */
export const MAX_EMPTY_RETRIES = 2;

/** Fallback message if the model fails to produce visible prose after retries. */
export const EMPTY_RESPONSE_FALLBACK_MESSAGE =
  "I'm sorry, I couldn't complete that step cleanly. Could you please rephrase or try again?";

/** Corrective prompt injected when a model turn produces empty or tag-only output. */
export const EMPTY_TURN_RECOVERY_PROMPT =
  "Your previous response was empty or contained an incomplete tool plan. " +
  "If you need to perform an action or look up data, emit a complete " +
  '<tool_plan>{"tool_calls":[{"name":"...","arguments":{...}}]}</tool_plan> block. ' +
  "Otherwise, respond directly in clear prose.";

/** Emits a structured real-time telemetry log entry onto the SSE stream. */
export function emitRunLog(
  emit: AgentEventEmitter,
  level: AgentRunLogLevel,
  message: string,
  detail?: string,
): void {
  emit({ type: AgentStreamEventType.LOG, level, message, detail });
}

/** Emits the end-of-turn model_turn phase transition event. */
export function emitModelTurnEnd(
  emit: AgentEventEmitter,
  turn: number,
  pendingAction: boolean,
  toolCallsCount: number,
): void {
  emit({
    type: AgentStreamEventType.PHASE,
    phase: ExecutionPhase.MODEL_TURN,
    status: PhaseStatus.END,
    turn,
    pendingAction,
    toolCalls: toolCallsCount,
  });
}

/**
 * Executes a batch of tool calls in parallel when all calls are read-only,
 * or sequentially when any call mutates state or requires confirmation.
 */
export async function executeToolBatch(
  toolCalls: LlmToolCall[],
  isReadOnly: ((toolName: string) => boolean) | undefined,
  emit: AgentEventEmitter,
  dispatchOne: (
    call: LlmToolCall,
  ) => Promise<{ call: LlmToolCall; result: Record<string, unknown> }>,
): Promise<Array<{ call: LlmToolCall; result: Record<string, unknown> }>> {
  const canParallelize =
    toolCalls.length > 1 && toolCalls.every((c) => isReadOnly?.(c.name) ?? false);

  if (canParallelize) {
    emitRunLog(
      emit,
      AgentRunLogLevel.TOOL,
      `Executing ${toolCalls.length} read tools in parallel`,
      toolCalls.map((c) => c.name).join(", "),
    );
    return Promise.all(toolCalls.map((call) => dispatchOne(call)));
  }

  const results: Array<{ call: LlmToolCall; result: Record<string, unknown> }> = [];
  for (const call of toolCalls) {
    results.push(await dispatchOne(call));
  }
  return results;
}

/** Emits the terminal MAX_ITERATIONS error and done event pair. */
export function emitMaxIterationsError(emit: AgentEventEmitter, message: string): void {
  emit({
    type: AgentStreamEventType.ERROR,
    error: message,
    code: AgentErrorCode.MAX_ITERATIONS,
  });
  emit({ type: AgentStreamEventType.DONE });
}

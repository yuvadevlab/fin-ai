import { AgentRunLogLevel } from "@fin-ai/shared-types";
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
  emit({ type: "log", level, message, detail });
}

/** Emits the end-of-turn model_turn phase transition event. */
export function emitModelTurnEnd(
  emit: AgentEventEmitter,
  turn: number,
  pendingAction: boolean,
  toolCallsCount: number,
): void {
  emit({
    type: "phase",
    phase: "model_turn",
    status: "end",
    turn,
    pendingAction,
    toolCalls: toolCallsCount,
  });
}

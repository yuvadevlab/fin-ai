/**
 * SSE protocol for the agent runtime (POST /agent/chat and action endpoints).
 * Extends the legacy advisor protocol with tool and confirmation events.
 *
 * The controller serializes each event as one `data: {json}\n\n` frame in
 * this order for a typical run:
 *   conversation → run → token* → tool_call → tool_result → token* → done
 * A write action inserts confirmation_required instead of executing, and the
 * confirm/reject endpoints reply with action_result.
 */
import {
  AgentCardType,
  AgentMode,
  AgentRunLogLevel,
  AgentStreamEventType,
  ExecutionPhase,
  PhaseStatus,
} from "@fin-ai/shared-types";

export interface AgentCard {
  /** Card kind — drives which UI component renders it. */
  type: AgentCardType;
  title: string;
  /** Key–value rows for table/insight cards. */
  rows?: [string, string][];
}

/**
 * Every event the agent can push to the client during a run. The client
 * switches on `type`; unknown types must be ignored for forward
 * compatibility (older clients + newer servers).
 */
export type AgentStreamEvent =
  /** First event: the conversation this run belongs to (new or existing). */
  | { type: typeof AgentStreamEventType.CONVERSATION; conversationId: string }
  /** Generated short summary title for the conversation (1st turn). */
  | { type: typeof AgentStreamEventType.TITLE; title: string }
  /** Unique id for this agent run — correlates usage/audit across events. */
  | { type: typeof AgentStreamEventType.RUN; runId: string }
  /**
   * Emitted once per run, right after routing resolves, so the UI can show
   * which runtime answered: "agent" (tool-enabled loop — can propose actions)
   * or "chat" (tool-free advisor fast-path — conversational only).
   */
  | { type: typeof AgentStreamEventType.MODE; mode: AgentMode }
  /** Real-time transparent execution log emitted by the agent runtime. */
  | {
      type: typeof AgentStreamEventType.LOG;
      level: AgentRunLogLevel;
      message: string;
      detail?: string;
    }
  /**
   * One streamed chunk (DELTA) of the assistant's visible answer text.
   * Clients must APPEND this to the current assistant message:
   *   message.text += content
   * Deltas are not cumulative snapshots — concatenating the deltas in order
   * reproduces the full answer exactly once.
   */
  | { type: typeof AgentStreamEventType.TOKEN; content: string }
  /** Live model thinking/reasoning delta (filtered of <tool_plan> tags). */
  | { type: typeof AgentStreamEventType.REASONING; content: string }
  /**
   * REPLACE the accumulated visible text of the current assistant message
   * with `content` (message.text = content — never append).
   */
  | { type: typeof AgentStreamEventType.TOKEN_REPLACE; content: string }
  /** The model started calling a tool (UI shows a progress chip). */
  | { type: typeof AgentStreamEventType.TOOL_CALL; tool: string; runId: string }
  /** Tool finished; `ok` = success and `summary` is the human-readable line. `label` is server-provided activity label. */
  | {
      type: typeof AgentStreamEventType.TOOL_RESULT;
      tool: string;
      ok: boolean;
      summary?: string;
      label?: string;
    }
  /**
   * Real agent lifecycle transition, emitted ONLY when the server actually
   * enters/leaves a phase — never on a timer.
   */
  | {
      type: typeof AgentStreamEventType.PHASE;
      phase: typeof ExecutionPhase.LOADING_CONTEXT | typeof ExecutionPhase.MODEL_TURN;
      status: PhaseStatus;
      turn?: number;
      pendingAction?: boolean;
      toolCalls?: number;
    }
  /** Passive information card (insight/table) to render in the thread. */
  | { type: typeof AgentStreamEventType.CARD; card: AgentCard }
  /**
   * A write action is PROPOSED and waiting for the user. Nothing has been
   * executed yet; the client must show the card with confirm/reject buttons
   * pointing at POST /agent/actions/:id/confirm|reject.
   */
  | {
      type: typeof AgentStreamEventType.CONFIRMATION_REQUIRED;
      actionId: string;
      tool: string;
      card: AgentCard;
    }
  /**
   * A pending action was updated (e.g. the user edited it through conversation).
   */
  | {
      type: typeof AgentStreamEventType.ACTION_UPDATED;
      actionId: string;
      tool: string;
      card: AgentCard;
      message?: string;
    }
  /** Outcome of a confirmed/rejected action (after the user clicks a button). */
  | {
      type: typeof AgentStreamEventType.ACTION_RESULT;
      actionId: string;
      ok: boolean;
      card?: AgentCard;
    }
  /** Token usage summary for the completed run (best-effort; 0 when unknown). */
  | { type: typeof AgentStreamEventType.USAGE; tokensIn: number; tokensOut: number }
  /** Terminal error (replaces or terminates the stream). */
  | { type: typeof AgentStreamEventType.ERROR; error: string; code?: string }
  /** Stream finished cleanly. Always the final event. */
  | { type: typeof AgentStreamEventType.DONE };

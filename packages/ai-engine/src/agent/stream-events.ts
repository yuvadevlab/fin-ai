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
export interface AgentCard {
  /** Card kind — drives which UI component renders it. */
  type: "insight" | "table" | "confirmation" | "entity";
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
  | { type: "conversation"; conversationId: string }
  /** Unique id for this agent run — correlates usage/audit across events. */
  | { type: "run"; runId: string }
  /**
   * Emitted once per run, right after routing resolves, so the UI can show
   * which runtime answered: "agent" (tool-enabled loop — can propose actions)
   * or "chat" (tool-free advisor fast-path — conversational only).
   */
  | { type: "mode"; mode: "agent" | "chat" }
  /**
   * One streamed chunk (DELTA) of the assistant's visible answer text.
   * Clients must APPEND this to the current assistant message:
   *   message.text += content
   * Deltas are not cumulative snapshots — concatenating the deltas in order
   * reproduces the full answer exactly once.
   */
  | { type: "token"; content: string }
  /**
   * REPLACE the accumulated visible text of the current assistant message
   * with `content` (message.text = content — never append).
   *
   * Why this exists: agent prose streams live BEFORE tools execute. When a
   * write tool turns out to require confirmation, that prose was generated
   * before the server resolved/validated the action and could contradict the
   * confirmation card (the card is the source of truth). Instead of
   * suppressing streaming, the runner streams everything and, if a
   * confirmation supersedes the prose, sends the standardized grounded text
   * as a `token_replace`. The user keeps real-time streaming AND the card can
   * never be contradicted by hallucinated details. Subsequent `token` events
   * append again after a replace.
   */
  | { type: "token_replace"; content: string }
  /** The model started calling a tool (UI shows a progress chip). */
  | { type: "tool_call"; tool: string; runId: string }
  /** Tool finished; `ok` = success and `summary` is the human-readable line. */
  | { type: "tool_result"; tool: string; ok: boolean; summary?: string }
  /**
   * Real agent lifecycle transition, emitted ONLY when the server actually
   * enters/leaves a phase — never on a timer. Powers the live activity
   * stream's "◌ Understanding your request…" / "◌ Loading financial
   * context…" steps:
   *   - loading_context: assembling grounding data + system prompt.
   *   - model_turn: one LLM inference round-trip (start → end). `turn` is
   *     1-based; `pendingAction` marks runs that continue a pending
   *     confirmation; `toolCalls` (end only) is how many tool calls the
   *     model decided on — 0 means the answer text follows immediately.
   */
  | {
      type: "phase";
      phase: "loading_context" | "model_turn";
      status: "start" | "end";
      turn?: number;
      pendingAction?: boolean;
      toolCalls?: number;
    }
  /** Passive information card (insight/table) to render in the thread. */
  | { type: "card"; card: AgentCard }
  /**
   * A write action is PROPOSED and waiting for the user. Nothing has been
   * executed yet; the client must show the card with confirm/reject buttons
   * pointing at POST /agent/actions/:id/confirm|reject.
   */
  | { type: "confirmation_required"; actionId: string; tool: string; card: AgentCard }
  /**
   * A pending action was updated (e.g. the user edited it through conversation).
   * The client should replace the existing confirmation card for `actionId`
   * with the new `card`. Nothing has been executed — the action remains
   * pending until the user explicitly confirms.
   */
  | { type: "action_updated"; actionId: string; tool: string; card: AgentCard; message?: string }
  /** Outcome of a confirmed/rejected action (after the user clicks a button). */
  | { type: "action_result"; actionId: string; ok: boolean; card?: AgentCard }
  /** Token accounting for the run (from the final LLM response). */
  | { type: "usage"; tokensIn: number; tokensOut: number }
  /** Terminal success event — the stream closes after this. */
  | { type: "done" }
  /** Terminal failure event — always followed by done (controller guarantees it). */
  | { type: "error"; error: string; code?: string };

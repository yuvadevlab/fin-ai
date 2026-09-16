import type { AgentCard } from "@finai/ai-engine";

/**
 * Runtime the server selected/forced for a single run, streamed via the SSE
 * `mode` event: "agent" = tool-enabled loop (can read data & propose actions);
 * "chat" = tool-free advisor fast-path (conversational only). Surfaced per
 * turn so the user always knows which mode answered.
 */
export type AgentResolvedMode = "agent" | "chat";

/**
 * Snapshot of an agent tool call's execution state, surfaced as an inline
 * chip in the chat. The `summary` is a short human-readable note (e.g.
 * "Retrieved 3 accounts") produced by the server when the tool finishes.
 * `startedAt` and `completedAt` are client-side timestamps (ms) used to
 * display step duration and total run time. `detail` is an optional longer
 * description shown in the expanded activity log (user-safe, never chain-of-thought).
 *
 * `kind` distinguishes the three real sources of activity:
 *   - "tool"     — a registry tool call (`tool_call`/`tool_result` events).
 *   - "phase"    — a server lifecycle phase (`phase` events): context loading
 *                  and LLM inference turns.
 *   - "approval" — the run is blocked waiting for the user to confirm/reject
 *                  a proposed action (`confirmation_required`).
 *
 * `status` follows the real lifecycle: items are appended as "running" the
 * moment their start event arrives and flip to a terminal state only when the
 * corresponding completion event streams. "pending" exists for future
 * planners that announce steps before starting them — the current runtime
 * never fabricates pending items.
 */
export interface AgentActivity {
  tool: string;
  status: "pending" | "running" | "success" | "error";
  kind?: "tool" | "phase" | "approval";
  summary?: string;
  detail?: string;
  /** Event-time label override (from the centralized activity mapper). */
  label?: string;
  startedAt?: number;
  completedAt?: number;
}

/**
 * Lifecycle status of an agent-proposed write action. `pending` means the
 * user has not yet confirmed or rejected; the other states are terminal.
 */
export type AgentConfirmationStatus = "pending" | "executed" | "rejected" | "failed";

/**
 * A write action the agent has proposed and is awaiting (or has resolved)
 * user confirmation for. The `card` holds the human-readable detail rows
 * shown in `AgentConfirmationCard`.
 */
export interface AgentConfirmation {
  actionId: string;
  tool: string;
  card: AgentCard;
  status: AgentConfirmationStatus;
}

export interface AgentRunLogEntry {
  id: string;
  timestamp: number;
  elapsedMs: number;
  level: "SYS" | "CTX" | "LLM" | "TOOL" | "STREAM" | "ACTION" | "DONE" | "ERR";
  message: string;
  detail?: string;
}

/**
 * A single message in the agent chat. User messages carry only `role` and
 * `text`. Assistant messages may carry a `streaming` flag (true while the
 * server is still sending tokens), accumulated `activities` (tool call
 * steps), `confirmations` (write-action cards), `logs` (real-time high-speed
 * processing logs), and an `error` message when the run failed.
 */
export interface AgentChatMessage {
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
  /** Runtime that answered this turn ("agent" vs "chat") — set from SSE `mode`. */
  mode?: AgentResolvedMode;
  activities?: AgentActivity[];
  confirmations?: AgentConfirmation[];
  logs?: AgentRunLogEntry[];
  error?: string;
}

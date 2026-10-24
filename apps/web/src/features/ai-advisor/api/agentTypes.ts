import type { AgentCard } from "@finai/ai-engine";
import type { AiProviderRole } from "@finai/shared-types";
import {
  AgentActivityKind,
  AgentActivityStatus,
  AgentChatRole,
  AgentConfirmationStatus,
  AgentRunLogLevel,
} from "@finai/shared-types";

export {
  AgentActivityKind,
  AgentActivityStatus,
  AgentChatRole,
  AgentConfirmationStatus,
  AgentRunLogLevel,
};

/**
 * Runtime the server selected/forced for a single run, streamed via the SSE
 * `mode` event: "agent" = tool-enabled loop (can read data & propose actions);
 * "chat" = tool-free advisor fast-path (conversational only). Surfaced per
 * turn so the user always knows which mode answered.
 */
export type AgentResolvedMode = AiProviderRole;

/**
 * Snapshot of an agent tool call's execution state, surfaced as an inline
 * chip in the chat.
 */
export interface AgentActivity {
  tool: string;
  status: AgentActivityStatus;
  kind?: AgentActivityKind;
  summary?: string;
  detail?: string;
  /** Event-time label override (from the centralized activity mapper). */
  label?: string;
  startedAt?: number;
  completedAt?: number;
}

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
  level: AgentRunLogLevel;
  message: string;
  detail?: string;
}

/**
 * A single message in the agent chat. User messages carry only `role` and
 * `text`.
 */
export interface AgentChatMessage {
  role: AgentChatRole;
  text: string;
  streaming?: boolean;
  /** Runtime that answered this turn ("agent" vs "chat") — set from SSE `mode`. */
  mode?: AgentResolvedMode;
  activities?: AgentActivity[];
  confirmations?: AgentConfirmation[];
  logs?: AgentRunLogEntry[];
  error?: string;
}

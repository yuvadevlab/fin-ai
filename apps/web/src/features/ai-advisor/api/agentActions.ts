import { apiClient } from "@/lib/api-client";

/**
 * Response shape returned by POST `/agent/actions/:id/confirm`.
 * - `alreadyExecuted`: true when the user re-submitted a confirmation for
 *   an action that had already been executed (idempotency).
 * - `result`: the serialized output of the tool on first execution, or the
 *   original stored result on re-confirmation.
 * - `rejected`: true (only when confirm is mis-called on a rejected action).
 */
export interface AgentActionResponse {
  alreadyExecuted?: boolean;
  result?: unknown;
  rejected?: boolean;
  itemIndex?: number;
  allCompleted?: boolean;
}

/** Confirm (execute) a proposed agent action. Idempotent server-side. */
export function confirmAgentAction(
  actionId: string,
  itemIndex?: number,
): Promise<AgentActionResponse> {
  return apiClient.post<AgentActionResponse>(`agent/actions/${actionId}/confirm`, {
    itemIndex,
  });
}

/** Reject a proposed agent action. */
export function rejectAgentAction(
  actionId: string,
  itemIndex?: number,
): Promise<{ rejected?: boolean; itemIndex?: number; allCompleted?: boolean }> {
  return apiClient.post<{ rejected?: boolean; itemIndex?: number; allCompleted?: boolean }>(
    `agent/actions/${actionId}/reject`,
    { itemIndex },
  );
}

/** Fetch all actions (any status) for a conversation, with pre-built cards. */
export function fetchConversationActions(
  conversationId: string,
): Promise<AgentActionHistoryItem[]> {
  return apiClient.get<AgentActionHistoryItem[]>(
    `agent/actions/history?conversationId=${encodeURIComponent(conversationId)}`,
  );
}

export interface AgentActionHistoryItem {
  actionId: string;
  tool: string;
  card: { type: string; title: string; rows?: [string, string][] };
  status: "pending" | "executed" | "rejected" | "failed";
  result?: unknown;
}

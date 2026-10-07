import { apiClient } from "@/lib";
import { API_ENDPOINTS, SEARCH_PARAMS } from "@finai/shared-types";

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
  return apiClient.post<AgentActionResponse>(API_ENDPOINTS.AGENT.CONFIRM_ACTION(actionId), {
    itemIndex,
  });
}

/** Reject a proposed agent action. */
export function rejectAgentAction(
  actionId: string,
  itemIndex?: number,
): Promise<{ rejected?: boolean; itemIndex?: number; allCompleted?: boolean }> {
  return apiClient.post<{ rejected?: boolean; itemIndex?: number; allCompleted?: boolean }>(
    API_ENDPOINTS.AGENT.REJECT_ACTION(actionId),
    { itemIndex },
  );
}

/** Fetch all actions (any status) for a conversation, with pre-built cards. */
export function fetchConversationActions(
  conversationId: string,
): Promise<AgentActionHistoryItem[]> {
  return apiClient.get<AgentActionHistoryItem[]>(
    `${API_ENDPOINTS.AGENT.ACTION_HISTORY}?${SEARCH_PARAMS.CONVERSATION_ID}=${encodeURIComponent(conversationId)}`,
  );
}

export interface AgentActionHistoryItem {
  actionId: string;
  tool: string;
  card: { type: string; title: string; rows?: [string, string][] };
  status: "pending" | "executed" | "rejected" | "failed";
  result?: unknown;
  createdAt?: string;
}

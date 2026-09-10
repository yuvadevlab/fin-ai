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
}

/** Confirm (execute) a proposed agent action. Idempotent server-side. */
export function confirmAgentAction(actionId: string): Promise<AgentActionResponse> {
  return apiClient.post<AgentActionResponse>(`agent/actions/${actionId}/confirm`);
}

/** Reject a proposed agent action. */
export function rejectAgentAction(actionId: string): Promise<{ rejected?: boolean }> {
  return apiClient.post<{ rejected?: boolean }>(`agent/actions/${actionId}/reject`);
}

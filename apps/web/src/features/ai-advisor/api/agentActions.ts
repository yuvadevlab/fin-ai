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

/** Confirm a single transaction within a proposed bulk action. */
export function confirmAgentActionItem(
  actionId: string,
  index: number,
): Promise<AgentActionItemResponse> {
  return apiClient.post<AgentActionItemResponse>(`agent/actions/${actionId}/confirm-item`, {
    index,
  });
}

/** Response for a single-item bulk confirm. `done` = every item confirmed. */
export interface AgentActionItemResponse {
  alreadyConfirmed?: boolean;
  done?: boolean;
  result?: unknown;
}

/** Reject a proposed agent action. */
export function rejectAgentAction(actionId: string): Promise<{ rejected?: boolean }> {
  return apiClient.post<{ rejected?: boolean }>(`agent/actions/${actionId}/reject`);
}

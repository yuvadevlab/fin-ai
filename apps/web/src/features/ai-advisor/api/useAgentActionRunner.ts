import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { confirmAgentAction, rejectAgentAction } from "./agentActions";
import { invalidateForAgentTool } from "./agentInvalidationMap";
import type { AgentActivity, AgentConfirmationStatus } from "./agentTypes";

/**
 * Owns the confirm/reject lifecycle for agent-proposed write actions.
 *
 * Extraction target for the 250-line rule: `useAgentChat` was approaching the
 * cap, so the action-buttons flow (HTTP call + local card/step resolution +
 * cache invalidation) lives here as a focused hook.
 */
interface ActionRunnerDeps {
  updateConfirmationStatus(actionId: string, status: AgentConfirmationStatus): void;
  resolveApprovalActivity(actionId: string, patch: Partial<AgentActivity>): void;
}

export function useAgentActionRunner({
  updateConfirmationStatus,
  resolveApprovalActivity,
}: ActionRunnerDeps) {
  const queryClient = useQueryClient();
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  const confirmAction = useCallback(
    async (actionId: string, tool: string) => {
      if (executingActionId) return;
      setExecutingActionId(actionId);
      try {
        await confirmAgentAction(actionId);
        updateConfirmationStatus(actionId, "executed");
        // The button path bypasses the SSE stream, so close the "Waiting for
        // your approval" activity step locally.
        resolveApprovalActivity(actionId, { status: "success", summary: "Action completed" });
        queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
        // Refresh every domain cache the executed tool may have changed.
        invalidateForAgentTool(queryClient, tool);
      } catch {
        updateConfirmationStatus(actionId, "failed");
        resolveApprovalActivity(actionId, { status: "error", summary: "Action failed" });
      } finally {
        setExecutingActionId(null);
      }
    },
    [executingActionId, queryClient, updateConfirmationStatus, resolveApprovalActivity],
  );

  const rejectAction = useCallback(
    async (actionId: string) => {
      if (executingActionId) return;
      setExecutingActionId(actionId);
      try {
        await rejectAgentAction(actionId);
        updateConfirmationStatus(actionId, "rejected");
        // Rejection is a deliberate completion, not an error.
        resolveApprovalActivity(actionId, { status: "success", summary: "Action rejected" });
      } catch {
        updateConfirmationStatus(actionId, "failed");
        resolveApprovalActivity(actionId, { status: "error", summary: "Action failed" });
      } finally {
        setExecutingActionId(null);
      }
    },
    [executingActionId, updateConfirmationStatus, resolveApprovalActivity],
  );

  return { executingActionId, confirmAction, rejectAction };
}

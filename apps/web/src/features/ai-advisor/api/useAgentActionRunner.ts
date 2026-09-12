import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { confirmAgentAction, confirmAgentActionItem, rejectAgentAction } from "./agentActions";
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
  const [executingItemIndex, setExecutingItemIndex] = useState<number | null>(null);
  const [isExecutingAll, setIsExecutingAll] = useState(false);
  /** actionId → indexes whose individual Confirm has succeeded. */
  const [confirmedItems, setConfirmedItems] = useState<Record<string, number[]>>({});

  const confirmAction = useCallback(
    async (actionId: string, tool: string) => {
      if (executingActionId) return;
      setExecutingActionId(actionId);
      try {
        await confirmAgentAction(actionId);
        updateConfirmationStatus(actionId, "executed");
        resolveApprovalActivity(actionId, { status: "success", summary: "Action completed" });
        queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
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

  /**
   * Confirm a single transaction within a bulk action by its index.
   * Executes just that one transaction via the transactions.create tool.
   * On success the item's Confirm button disappears; when the LAST item is
   * confirmed the whole card flips to "executed".
   */
  const confirmItem = useCallback(
    async (actionId: string, tool: string, index: number) => {
      if (executingActionId || executingItemIndex !== null || isExecutingAll) return;
      setExecutingActionId(actionId);
      setExecutingItemIndex(index);
      try {
        const res = await confirmAgentActionItem(actionId, index);
        if (!res.alreadyConfirmed) {
          setConfirmedItems((prev) => {
            const list = prev[actionId] ?? [];
            if (list.includes(index)) return prev;
            return { ...prev, [actionId]: [...list, index].sort((a, b) => a - b) };
          });
        }
        resolveApprovalActivity(actionId, {
          status: "success",
          summary: `Transaction #${index + 1} recorded`,
        });
        queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
        invalidateForAgentTool(queryClient, tool);
        if (res.done) updateConfirmationStatus(actionId, "executed");
      } catch {
        resolveApprovalActivity(actionId, {
          status: "error",
          summary: `Transaction #${index + 1} failed`,
        });
      } finally {
        setExecutingActionId(null);
        setExecutingItemIndex(null);
      }
    },
    [
      executingActionId,
      executingItemIndex,
      isExecutingAll,
      queryClient,
      resolveApprovalActivity,
      updateConfirmationStatus,
    ],
  );

  /**
   * Sequentially confirms a list of actions, one at a time.
   * Each action waits for the previous to finish before starting,
   * respecting the single-execution guard.
   */
  const confirmAll = useCallback(
    async (actions: Array<{ actionId: string; tool: string }>) => {
      setIsExecutingAll(true);
      for (const { actionId, tool } of actions) {
        // Skip already-executed or in-flight actions
        if (executingActionId) continue;
        setExecutingActionId(actionId);
        try {
          await confirmAgentAction(actionId);
          updateConfirmationStatus(actionId, "executed");
          resolveApprovalActivity(actionId, { status: "success", summary: "Action completed" });
          queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
          invalidateForAgentTool(queryClient, tool);
        } catch {
          updateConfirmationStatus(actionId, "failed");
          resolveApprovalActivity(actionId, { status: "error", summary: "Action failed" });
        } finally {
          setExecutingActionId(null);
        }
      }
      setIsExecutingAll(false);
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

  return {
    executingActionId,
    executingItemIndex,
    isExecutingAll,
    confirmedItems,
    confirmAction,
    confirmItem,
    confirmAll,
    rejectAction,
  };
}

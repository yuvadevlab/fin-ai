import { useCallback, useState } from "react";
import type {
  AgentConfirmation,
  AgentChatMessage,
  AgentActivity,
  AgentConfirmationStatus,
} from "./agentTypes";

/**
 * Owns the agent message list state and all immutable updater callbacks.
 * Kept separate from the streaming hook so each file stays small.
 */
export function useAgentMessages() {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);

  const appendText = useCallback((content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "assistant") return prev;
      copy[copy.length - 1] = { ...last, text: last.text + content };
      return copy;
    });
  }, []);

  /**
   * Replaces (NOT appends) the last assistant message's text. The backend
   * sends `token_replace` when streamed pre-tool prose must be superseded by
   * the grounded standardized confirmation message — this keeps a single
   * final message (no duplicates) while still allowing real streaming before
   * the replace arrives.
   */
  const replaceText = useCallback((content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "assistant") return prev;
      copy[copy.length - 1] = { ...last, text: content };
      return copy;
    });
  }, []);

  const appendActivity = useCallback((activity: AgentActivity) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "assistant") return prev;
      copy[copy.length - 1] = {
        ...last,
        activities: [...(last.activities ?? []), { ...activity, startedAt: Date.now() }],
      };
      return copy;
    });
  }, []);

  const updateActivity = useCallback((tool: string, patch: Partial<AgentActivity>) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "assistant") return prev;
      const activities = (last.activities ?? []).slice();
      // Find the most recent activity for this tool (iterating backwards) so
      // the chip can be updated regardless of its current state — e.g. from
      // "Awaiting your confirmation" (success) to "Confirmed" (success) after
      // the user clicks the confirm button.
      for (let i = activities.length - 1; i >= 0; i--) {
        if (activities[i].tool === tool) {
          // Stamp completedAt when transitioning from running to a terminal state.
          const isCompleting =
            activities[i].status === "running" && patch.status && patch.status !== "running";
          activities[i] = {
            ...activities[i],
            ...patch,
            ...(isCompleting && !activities[i].completedAt ? { completedAt: Date.now() } : {}),
          };
          break;
        }
      }
      copy[copy.length - 1] = { ...last, activities };
      return copy;
    });
  }, []);

  const appendConfirmation = useCallback((confirmation: AgentConfirmation) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "assistant") return prev;
      copy[copy.length - 1] = {
        ...last,
        confirmations: [...(last.confirmations ?? []), confirmation],
      };
      return copy;
    });
  }, []);

  const updateConfirmationStatus = useCallback(
    (actionId: string, status: AgentConfirmationStatus) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.confirmations?.some((c) => c.actionId === actionId)
            ? {
                ...m,
                confirmations: m.confirmations.map((c) =>
                  c.actionId === actionId ? { ...c, status } : c,
                ),
              }
            : m,
        ),
      );
    },
    [],
  );

  /**
   * Update the confirmation card for a pending action in place (e.g. when the
   * user edits the action through conversation). Replaces the card for the
   * matching actionId without creating a duplicate — the pending action is the
   * source of truth and the card is its projection.
   */
  const updateConfirmationCard = useCallback(
    (actionId: string, card: import("@finai/ai-engine").AgentCard) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.confirmations?.some((c) => c.actionId === actionId)
            ? {
                ...m,
                confirmations: m.confirmations.map((c) =>
                  c.actionId === actionId ? { ...c, card } : c,
                ),
              }
            : m,
        ),
      );
    },
    [],
  );

  /**
   * Resolves the "Waiting for your approval" step for a proposed action,
   * searching ALL messages (not just the last) because the outcome can arrive
   * after the user clicked a card button on an older turn.
   */
  const resolveApprovalActivity = useCallback((actionId: string, patch: Partial<AgentActivity>) => {
    const key = `approval:${actionId}`;
    setMessages((prev) =>
      prev.map((m) =>
        m.activities?.some((a) => a.tool === key)
          ? {
              ...m,
              activities: m.activities.map((a) =>
                a.tool === key
                  ? {
                      ...a,
                      ...patch,
                      ...(a.status === "running" &&
                      patch.status &&
                      patch.status !== "running" &&
                      !a.completedAt
                        ? { completedAt: Date.now() }
                        : {}),
                    }
                  : a,
              ),
            }
          : m,
      ),
    );
  }, []);

  const failStream = useCallback((errorText: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "assistant") return prev;
      // Mark any still-running steps as failed (✕) so the timeline never
      // shows a spinner for work that has permanently stopped.
      const activities = (last.activities ?? []).map((a) =>
        a.status === "running"
          ? {
              ...a,
              status: "error" as const,
              summary: a.summary ?? "Interrupted",
              completedAt: a.completedAt ?? Date.now(),
            }
          : a,
      );
      copy[copy.length - 1] = {
        ...last,
        activities,
        error: errorText,
        streaming: false,
      };
      return copy;
    });
  }, []);

  /**
   * Marks the last assistant turn as no longer streaming. Called when the
   * server sends `done`, when the user aborts, and when the connection closes
   * so the message-level `streaming` flag never gets stuck on `true`
   * (which would suppress follow-ups and keep spinners alive).
   */
  const endStream = useCallback(() => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "assistant" || !last.streaming) return prev;
      copy[copy.length - 1] = { ...last, streaming: false };
      return copy;
    });
  }, []);

  const pushUserTurn = useCallback((question: string) => {
    setMessages((prev) => [...prev, { role: "user", text: question }]);
  }, []);

  const pushAssistantTurn = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "", streaming: true, activities: [], confirmations: [] },
    ]);
  }, []);

  const replaceMessages = useCallback((next: AgentChatMessage[]) => {
    setMessages(next);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    appendText,
    replaceText,
    appendActivity,
    updateActivity,
    resolveApprovalActivity,
    appendConfirmation,
    updateConfirmationStatus,
    updateConfirmationCard,
    failStream,
    endStream,
    pushUserTurn,
    pushAssistantTurn,
    replaceMessages,
    clearMessages,
  };
}

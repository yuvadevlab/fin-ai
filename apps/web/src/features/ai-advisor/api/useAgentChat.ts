import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AgentStreamEvent } from "@finai/ai-engine";
import { API_BASE_URL, apiClient } from "@/lib/api-client";
import { confirmAgentAction, rejectAgentAction } from "./agentActions";
import { invalidateForAgentTool } from "./agentInvalidationMap";
import { handleAgentStreamEvent, type AgentEventPort } from "./agentEventHandlers";
import { useAgentMessages } from "./useAgentMessages";
import type { AiConversation } from "./useConversations";

/**
 * Streaming agent chat hook. Consumes the SSE `AgentStreamEvent` union from
 * POST /agent/chat and renders tool activity + confirmation cards alongside
 * the prose stream.
 */
export function useAgentChat() {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const {
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
  } = useAgentMessages();

  /**
   * Aborts any in-flight SSE stream and marks streaming as complete. Called
   * by the UI's "Stop" button and when starting a new chat while a stream is
   * active.
   */
  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    /**
     * Sends the user's question to the agent endpoint and processes the SSE
     * stream event-by-event through the centralized event handler
     * (`handleAgentStreamEvent`) — lifecycle phases, tool activity, approval
     * steps, confirmation cards, and action results all map onto message
     * state there. The loop buffers partial SSE frames so a chunk that
     * arrives mid-line is handled on the next read.
     */
    async (question: string) => {
      if (isStreaming) return;

      pushUserTurn(question);
      pushAssistantTurn();
      setIsStreaming(true);

      const token = typeof window !== "undefined" ? localStorage.getItem("finai_token") : null;
      abortRef.current = new AbortController();

      // The event → state port. Every SSE event is mapped onto message state
      // by `handleAgentStreamEvent` (centralized in agentEventHandlers.ts):
      // lifecycle phases, tool activity, approval steps, cards, failures.
      const port: AgentEventPort = {
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
        onConversation: (id) => setConversationId((prev) => prev ?? id),
      };

      try {
        const res = await fetch(`${API_BASE_URL}/agent/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ question, conversationId: conversationId ?? undefined }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Agent service returned ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let event: AgentStreamEvent;
            try {
              event = JSON.parse(raw) as AgentStreamEvent;
            } catch {
              continue;
            }

            // Centralized event → UI mapping (phases, tool activity, approval
            // steps, cards). Returns true on terminal events (`done`/`error`)
            // — stop reading the stream.
            if (handleAgentStreamEvent(event, port)) return;
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Failed to connect to the agent";
        failStream(msg);
      } finally {
        // Safety net: if the stream ended without a `done` event (connection
        // drop, abort), make sure the message-level streaming flag is cleared.
        endStream();
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
      }
    },
    [
      isStreaming,
      pushUserTurn,
      pushAssistantTurn,
      conversationId,
      appendText,
      replaceText,
      appendActivity,
      updateActivity,
      resolveApprovalActivity,
      appendConfirmation,
      updateConfirmationCard,
      updateConfirmationStatus,
      failStream,
      endStream,
      queryClient,
    ],
  );

  const loadConversation = useCallback(
    async (id: string) => {
      if (isStreaming) return;
      try {
        const convo = await apiClient.get<AiConversation>(`ai/conversations/${id}`);
        if (!convo) return;
        setConversationId(convo.id);
        replaceMessages(
          (convo.messages ?? []).map((m) => ({
            role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
            text: m.content,
          })),
        );
      } catch {
        // failed to load
      }
    },
    [isStreaming, replaceMessages],
  );

  const startNewChat = useCallback(() => {
    abortRef.current?.abort();
    clearMessages();
    setConversationId(null);
    setIsStreaming(false);
  }, [clearMessages]);

  const confirmAction = useCallback(
    async (actionId: string, tool: string) => {
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
      }
    },
    [queryClient, updateConfirmationStatus, resolveApprovalActivity],
  );

  const rejectAction = useCallback(
    async (actionId: string) => {
      try {
        await rejectAgentAction(actionId);
        updateConfirmationStatus(actionId, "rejected");
        // Rejection is a deliberate completion, not an error.
        resolveApprovalActivity(actionId, { status: "success", summary: "Action rejected" });
      } catch {
        updateConfirmationStatus(actionId, "failed");
        resolveApprovalActivity(actionId, { status: "error", summary: "Action failed" });
      }
    },
    [updateConfirmationStatus, resolveApprovalActivity],
  );

  return {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    loadConversation,
    startNewChat,
    stopStreaming,
    confirmAction,
    rejectAction,
  };
}

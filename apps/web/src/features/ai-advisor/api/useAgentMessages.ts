import { useCallback, useState } from "react";
import type {
  AgentConfirmation,
  AgentChatMessage,
  AgentActivity,
  AgentConfirmationStatus,
  AgentRunLogEntry,
} from "./agentTypes";
import {
  appendActivityReducer,
  appendConfirmationReducer,
  appendLogReducer,
  appendTextReducer,
  endStreamReducer,
  failStreamReducer,
  replaceTextReducer,
  resolveApprovalActivityReducer,
  updateActivityReducer,
  updateConfirmationCardReducer,
  updateConfirmationStatusReducer,
} from "./agentMessageReducers";

/**
 * Owns the agent message list state and exposes immutable updater callbacks.
 * Core reducer logic lives in `agentMessageReducers.ts` (Rule 7 250-line rule).
 */
export function useAgentMessages() {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);

  const appendLog = useCallback((log: AgentRunLogEntry) => {
    setMessages((prev) => appendLogReducer(prev, log));
  }, []);

  const appendText = useCallback((content: string) => {
    setMessages((prev) => appendTextReducer(prev, content));
  }, []);

  const replaceText = useCallback((content: string) => {
    setMessages((prev) => replaceTextReducer(prev, content));
  }, []);

  const appendActivity = useCallback((activity: AgentActivity) => {
    setMessages((prev) => appendActivityReducer(prev, activity));
  }, []);

  const updateActivity = useCallback((tool: string, patch: Partial<AgentActivity>) => {
    setMessages((prev) => updateActivityReducer(prev, tool, patch));
  }, []);

  const appendConfirmation = useCallback((confirmation: AgentConfirmation) => {
    setMessages((prev) => appendConfirmationReducer(prev, confirmation));
  }, []);

  const updateConfirmationStatus = useCallback(
    (actionId: string, status: AgentConfirmationStatus) => {
      setMessages((prev) => updateConfirmationStatusReducer(prev, actionId, status));
    },
    [],
  );

  const updateConfirmationCard = useCallback(
    (actionId: string, card: import("@finai/ai-engine").AgentCard) => {
      setMessages((prev) => updateConfirmationCardReducer(prev, actionId, card));
    },
    [],
  );

  const resolveApprovalActivity = useCallback((actionId: string, patch: Partial<AgentActivity>) => {
    setMessages((prev) => resolveApprovalActivityReducer(prev, actionId, patch));
  }, []);

  const failStream = useCallback((errorText: string) => {
    setMessages((prev) => failStreamReducer(prev, errorText));
  }, []);

  const endStream = useCallback(() => {
    setMessages((prev) => endStreamReducer(prev));
  }, []);

  const pushUserTurn = useCallback((question: string) => {
    setMessages((prev) => [...prev, { role: "user", text: question }]);
  }, []);

  const pushAssistantTurn = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "", streaming: true, activities: [], confirmations: [], logs: [] },
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
    appendLog,
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

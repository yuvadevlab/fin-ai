"use client";

/**
 * @file apps/web/src/features/ai-advisor/api/useAgentChat.ts
 * @description Primary client hook managing SSE streaming, tool action approvals, and zero-latency caching.
 * @module @finai/web/features/ai-advisor/api/useAgentChat
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StorageKey, QUERY_KEYS } from "@finai/shared-types";
import { APP_ROUTES } from "@/lib";
import { type AgentEventPort } from "./agentEventHandlers";
import { streamAgentChat } from "./agentChatStreamer";
import { useAgentActionRunner } from "./useAgentActionRunner";
import { useAgentMessages } from "./useAgentMessages";
import { fetchAndHydrateConversation } from "./conversationHydration";
import { loadCachedMessages, saveCachedMessages } from "./chatStorage";
import type { AgentChatMessage } from "./agentTypes";

/** Options configuration for the {@link useAgentChat} hook */
export interface UseAgentChatOptions {
  /** Callback fired whenever a new conversation UUID is assigned by the server */
  onConversationAssigned?: (conversationId: string) => void;
}

/**
 * Manages autonomous agent chat streaming, approval action execution, and conversation state.
 *
 * @param options - Optional configuration options including thread assignment callback.
 * @returns State and dispatch methods for the AI Advisor interface.
 */
export function useAgentChat(options?: UseAgentChatOptions) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, AgentChatMessage[]>>(new Map());

  const {
    messages,
    portMethods,
    pushUserTurn,
    pushAssistantTurn,
    setMode,
    replaceMessages,
    clearMessages,
  } = useAgentMessages();

  const { executingActionId, confirmAction, rejectAction } = useAgentActionRunner({
    updateConfirmationStatus: portMethods.updateConfirmationStatus,
    resolveApprovalActivity: portMethods.resolveApprovalActivity,
  });

  /** Stops any in-flight SSE stream and updates streaming status */
  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  // Synchronize completed message history to fast in-memory & sessionStorage cache
  useEffect(() => {
    if (conversationId && messages.length > 0 && !isStreaming) {
      cacheRef.current.set(conversationId, messages);
      saveCachedMessages(conversationId, messages);
    }
  }, [conversationId, messages, isStreaming]);

  /** Sends a prompt to the agent service and processes the SSE event stream */
  const sendMessage = useCallback(
    async (question: string) => {
      if (isStreaming) return;

      pushUserTurn(question);
      pushAssistantTurn();
      setIsStreaming(true);

      const token = typeof window !== "undefined" ? localStorage.getItem(StorageKey.TOKEN) : null;
      abortRef.current = new AbortController();

      const port: AgentEventPort = {
        ...portMethods,
        onConversation: (id) => {
          setConversationId((prev) => prev ?? id);
          if (typeof window !== "undefined") {
            window.history.replaceState(null, "", APP_ROUTES.ADVISOR_THREAD(id));
          }
          options?.onConversationAssigned?.(id);
        },
        onTitle: () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI.CONVERSATIONS });
        },
        onMode: (mode) => setMode(mode),
      };

      try {
        await streamAgentChat({
          question,
          conversationId: conversationId ?? null,
          token,
          signal: abortRef.current.signal,
          port,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Failed to connect to the agent";
        portMethods.failStream(msg);
      } finally {
        portMethods.endStream();
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI.CONVERSATIONS });
      }
    },
    [
      isStreaming,
      pushUserTurn,
      pushAssistantTurn,
      portMethods,
      setMode,
      conversationId,
      queryClient,
      options,
    ],
  );

  /** Loads conversation history using instant cache-first lookup followed by API fetch */
  const loadConversation = useCallback(
    async (id: string) => {
      if (isStreaming) return;
      if (conversationId === id && messages.length > 0) return;

      // 1. Instant 0ms cache check (in-memory Map followed by sessionStorage)
      const cached = cacheRef.current.get(id) ?? loadCachedMessages(id);
      if (cached && cached.length > 0) {
        cacheRef.current.set(id, cached);
        setConversationId(id);
        replaceMessages(cached);
        setIsLoadingConversation(false);
        return;
      }

      // 2. Cold load from API when not cached locally
      setIsLoadingConversation(true);
      try {
        const hydrated = await fetchAndHydrateConversation(id);
        if (!hydrated) return;
        setConversationId(id);
        cacheRef.current.set(id, hydrated);
        saveCachedMessages(id, hydrated);
        replaceMessages(hydrated);
      } catch {
        // Graceful error fallback
      } finally {
        setIsLoadingConversation(false);
      }
    },
    [isStreaming, conversationId, messages.length, replaceMessages],
  );

  /** Resets state to start a fresh unattached conversational session */
  const startNewChat = useCallback(() => {
    abortRef.current?.abort();
    clearMessages();
    setConversationId(null);
    setIsStreaming(false);
    setIsLoadingConversation(false);
  }, [clearMessages]);

  return {
    messages,
    isStreaming,
    isLoadingConversation,
    conversationId,
    executingActionId,
    sendMessage,
    loadConversation,
    startNewChat,
    stopStreaming,
    confirmAction,
    rejectAction,
  };
}

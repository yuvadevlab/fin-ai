import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, apiClient } from "@/lib/api-client";
import type { AiConversation } from "./useConversations";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  /** Set to true while this assistant message is still streaming */
  streaming?: boolean;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      if (isStreaming) return;

      // Add user turn immediately
      setMessages((prev) => [...prev, { role: "user", text: question }]);

      // Add empty streaming assistant bubble
      setMessages((prev) => [...prev, { role: "assistant", text: "", streaming: true }]);
      setIsStreaming(true);

      const token = typeof window !== "undefined" ? localStorage.getItem("finai_token") : null;

      abortRef.current = new AbortController();

      try {
        const res = await fetch(`${API_BASE_URL}/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            question,
            conversationId: conversationId ?? undefined,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`AI service returned ${res.status}`);
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

            try {
              const parsed = JSON.parse(raw) as {
                conversationId?: string;
                token?: string;
                done?: boolean;
                error?: string;
              };

              if (parsed.error) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant") {
                    copy[copy.length - 1] = {
                      role: "assistant",
                      text: `Error: ${parsed.error}`,
                      streaming: false,
                    };
                  }
                  return copy;
                });
                return;
              }

              if (parsed.conversationId && !conversationId) {
                setConversationId(parsed.conversationId);
              }

              if (parsed.token) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant") {
                    copy[copy.length - 1] = {
                      role: "assistant",
                      text: last.text + parsed.token,
                      streaming: true,
                    };
                  }
                  return copy;
                });
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Failed to connect to AI advisor";
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant") {
            copy[copy.length - 1] = {
              role: "assistant",
              text: `⚠️ ${msg}. Please ensure Ollama is running with qwen2.5:7b.`,
              streaming: false,
            };
          }
          return copy;
        });
      } finally {
        setIsStreaming(false);
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant") {
            copy[copy.length - 1] = { ...last, streaming: false };
          }
          return copy;
        });
        queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
      }
    },
    [conversationId, isStreaming, queryClient],
  );

  const loadConversation = useCallback(
    async (id: string) => {
      if (isStreaming) return;
      try {
        const convo = await apiClient.get<AiConversation>(`ai/conversations/${id}`);
        if (!convo) return;
        setConversationId(convo.id);
        const mapped: ChatMessage[] = (convo.messages ?? []).map((m) => ({
          role: m.role === "USER" ? "user" : "assistant",
          text: m.content,
        }));
        setMessages(mapped);
      } catch {
        // failed to load
      }
    },
    [isStreaming],
  );

  const startNewChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(null);
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    loadConversation,
    startNewChat,
    startNewConversation: startNewChat,
    stopStreaming,
  };
}

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-client";
import type { AiConversation } from "./useConversations";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  /** Set to true while this assistant message is still streaming */
  streaming?: boolean;
}

interface UseAiChatOptions {
  workspaceId: string | null;
}

export function useAiChat({ workspaceId }: UseAiChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = useCallback(
    async (question: string) => {
      if (!workspaceId || isStreaming) return;

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
            workspaceId,
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
        let accumulated = "";
        let serverConversationId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const parsed = JSON.parse(raw) as {
                token?: string;
                done?: boolean;
                conversationId?: string;
                error?: string;
              };

              if (parsed.error) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last?.streaming) {
                    copy[copy.length - 1] = {
                      ...last,
                      text: "⚠️ AI service is unavailable. Make sure Ollama is running.",
                      streaming: false,
                    };
                  }
                  return copy;
                });
                return;
              }

              if (parsed.conversationId) {
                serverConversationId = parsed.conversationId;
                setConversationId(parsed.conversationId);
              }

              if (parsed.token) {
                accumulated += parsed.token;
                const snapshot = accumulated;
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last?.streaming) {
                    copy[copy.length - 1] = { ...last, text: snapshot };
                  }
                  return copy;
                });
              }

              if (parsed.done) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last?.streaming) {
                    copy[copy.length - 1] = { ...last, streaming: false };
                  }
                  return copy;
                });
              }
            } catch {
              // skip malformed JSON chunks
            }
          }
        }

        // Invalidate conversation list so sidebar updates
        if (serverConversationId) {
          await queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;

        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.streaming) {
            copy[copy.length - 1] = {
              ...last,
              text: "⚠️ Could not reach the AI service. Please try again.",
              streaming: false,
            };
          }
          return copy;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [workspaceId, isStreaming, conversationId, queryClient],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
  }, []);

  const loadConversation = useCallback((convo: AiConversation) => {
    setConversationId(convo.id);
    setMessages(
      convo.messages.map((m) => ({
        role: (m.role === "USER" ? "user" : "assistant") as "user" | "assistant",
        text: m.content,
      })),
    );
  }, []);

  return {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    stopStreaming,
    startNewConversation,
    loadConversation,
  };
}

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api-client";

export type InsightPage = "dashboard" | "budgets" | "reports" | "family";

interface UseAiInsightOptions {
  workspaceId: string | null;
  page: InsightPage;
  /** Set false to skip auto-fetch on mount (e.g. behind a feature flag check) */
  enabled?: boolean;
}

interface UseAiInsightResult {
  text: string;
  isStreaming: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Streams a short AI-generated insight for a specific page.
 * Uses the GET /ai/insight SSE endpoint.
 */
export function useAiInsight({
  workspaceId,
  page,
  enabled = true,
}: UseAiInsightOptions): UseAiInsightResult {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isError, setIsError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fetchedRef = useRef(false);

  const fetchInsight = useCallback(async () => {
    if (!workspaceId) return;

    // Abort any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setText("");
    setIsError(false);
    setIsStreaming(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("finai_token") : null;

    try {
      const url = `${API_BASE_URL}/ai/insight?workspaceId=${encodeURIComponent(workspaceId)}&page=${page}`;
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        setIsError(true);
        return;
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
              token?: string;
              done?: boolean;
              error?: string;
            };

            if (parsed.error) {
              setIsError(true);
              return;
            }
            if (parsed.token) {
              setText((prev) => prev + parsed.token);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setIsError(true);
    } finally {
      setIsStreaming(false);
    }
  }, [workspaceId, page]);

  useEffect(() => {
    if (!enabled || !workspaceId || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchInsight();

    return () => {
      abortRef.current?.abort();
    };
  }, [enabled, workspaceId, fetchInsight]);

  const refetch = useCallback(() => {
    fetchedRef.current = false;
    fetchInsight();
  }, [fetchInsight]);

  return { text, isStreaming, isError, refetch };
}

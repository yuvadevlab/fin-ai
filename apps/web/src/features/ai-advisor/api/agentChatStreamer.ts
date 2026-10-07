/**
 * @file apps/web/src/features/ai-advisor/api/agentChatStreamer.ts
 * @description Helper for streaming SSE agent chat responses and parsing events.
 * @module @finai/web/features/ai-advisor/api/agentChatStreamer
 */

import type { AgentStreamEvent } from "@finai/ai-engine";
import { API_BASE_URL, API_ROUTES } from "@/lib";
import { handleAgentStreamEvent, type AgentEventPort } from "./agentEventHandlers";

/** Parameters required to stream an agent chat turn over SSE */
export interface StreamAgentChatParams {
  question: string;
  conversationId: string | null;
  token: string | null;
  signal: AbortSignal;
  port: AgentEventPort;
}

/**
 * Executes the POST request to the agent chat SSE endpoint and streams events into the event port.
 */
export async function streamAgentChat({
  question,
  conversationId,
  token,
  signal,
  port,
}: StreamAgentChatParams): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${API_ROUTES.AGENT_CHAT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question, conversationId: conversationId ?? undefined }),
    signal,
  });

  if (!res.ok || !res.body) throw new Error(`Agent service returned ${res.status}`);

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

      // Map incoming SSE event onto React state (returns true on done/error)
      if (handleAgentStreamEvent(event, port)) return;
    }
  }
}

/**
 * Ollama chat model — the ONLY LLM provider for this migration.
 *
 * Talks to the Ollama `/api/chat` endpoint (NDJSON streaming). Supports the
 * native `tools` parameter where the model supports function calling; models
 * without native support use the JSON-planning fallback in `json-planning.ts`
 * (handled by the agent orchestrator, not here).
 */

import {
  type ChatModel,
  type ChatModelConfig,
  LlmConnectionError,
  type LlmChatRequest,
  type LlmCompleteResult,
  type LlmMessage,
  type LlmStreamEvent,
  type LlmToolCall,
  type LlmToolDefinition,
} from "./types";

interface OllamaToolCallFunction {
  name: string;
  arguments: Record<string, unknown> | string;
}

interface OllamaChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_name?: string;
  tool_calls?: { function: OllamaToolCallFunction }[];
}

interface OllamaChatChunk {
  model?: string;
  created_at?: string;
  message?: OllamaChatMessage;
  done?: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Map neutral LLM messages to Ollama's wire format. Tool results travel as
 * role:"tool" messages and Ollama additionally requires the originating
 * `tool_name`, which the shared type carries as `toolName`.
 */
function toOllamaMessages(messages: LlmMessage[]): OllamaChatMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
    ...(m.role === "tool" && m.toolName ? { tool_name: m.toolName } : {}),
  }));
}

/** Map neutral tool definitions to Ollama's OpenAI-style function format. */
function toOllamaTools(tools: LlmToolDefinition[]) {
  return tools.map((t) => ({
    type: "function" as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

/**
 * Normalize Ollama tool calls into the neutral LlmToolCall shape.
 *
 * `arguments` may arrive as a JSON object OR a raw JSON string depending on
 * model/version, so both are normalized to a string — the agent layer parses
 * it once, downstream. Ollama does not assign call ids, so a monotonically
 * increasing counter (wrapped in an object so it persists across chunks)
 * generates stable `call_N` identifiers for the orchestrator.
 */
function toToolCalls(
  message: OllamaChatMessage | undefined,
  counter: { n: number },
): LlmToolCall[] {
  if (!message?.tool_calls?.length) return [];
  return message.tool_calls.map((tc) => {
    const raw = tc.function.arguments;
    return {
      id: `call_${++counter.n}`,
      name: tc.function.name,
      arguments: typeof raw === "string" ? raw : JSON.stringify(raw ?? {}),
    };
  });
}

export class OllamaChatModel implements ChatModel {
  readonly provider = "ollama";

  constructor(private readonly config: ChatModelConfig) {}

  get model(): string {
    return this.config.model;
  }

  private endpoint(): string {
    return `${this.config.baseUrl.replace(/\/+$/, "")}${this.config.apiPath}`;
  }

  private async openStream(request: LlmChatRequest): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(this.endpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.model,
          messages: toOllamaMessages(request.messages),
          // Tools are only included when the caller supplied some; the key
          // is omitted entirely otherwise.
          ...(request.tools?.length ? { tools: toOllamaTools(request.tools) } : {}),
          stream: true,
        }),
      });
    } catch {
      // fetch rejects on network-level failures (server down, DNS, refused).
      // Wrapping in LlmConnectionError gives callers an actionable message
      // instead of an opaque TypeError, and a catchable error type for
      // fallback/retry logic.
      throw new LlmConnectionError(
        `Ollama is not reachable at ${this.config.baseUrl}. Make sure Ollama is running.`,
      );
    }

    if (!response.ok || !response.body) {
      throw new LlmConnectionError(`Ollama error: ${response.status} ${response.statusText}`);
    }
    return response;
  }

  /**
   * Stream a chat completion as neutral LlmStreamEvents.
   *
   * Ollama streams NDJSON — one JSON object per line. The read loop cannot
   * assume reads align with line boundaries, so bytes accumulate in a
   * `buffer` and only complete lines are parsed; the remainder stays for the
   * next read. Token usage arrives on the final chunk (`done: true`), so it
   * is captured into the `usage` event yielded at the end.
   */
  async *stream(request: LlmChatRequest): AsyncIterable<LlmStreamEvent> {
    const response = await this.openStream(request);
    const counter = { n: 0 };
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let tokensIn = 0;
    let tokensOut = 0;

    const handleChunk = (chunk: OllamaChatChunk): LlmStreamEvent[] => {
      const events: LlmStreamEvent[] = [];
      if (chunk.message?.content) {
        events.push({ type: "text-delta", text: chunk.message.content });
      }
      for (const toolCall of toToolCalls(chunk.message, counter)) {
        events.push({ type: "tool_call", toolCall });
      }
      if (chunk.done) {
        tokensIn = chunk.prompt_eval_count ?? 0;
        tokensOut = chunk.eval_count ?? 0;
      }
      return events;
    };

    const finish = function* (): Generator<LlmStreamEvent> {
      if (tokensIn || tokensOut) {
        yield { type: "usage", tokensIn, tokensOut };
      }
      yield { type: "done" };
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // A read can end mid-line, so only parse complete lines and keep the
      // last (possibly partial) element buffered for the next read.
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let chunk: OllamaChatChunk;
        try {
          chunk = JSON.parse(trimmed) as OllamaChatChunk;
        } catch {
          continue; // skip unparseable chunks
        }
        for (const event of handleChunk(chunk)) {
          yield event;
          if (event.type === "usage") {
            tokensIn = event.tokensIn;
            tokensOut = event.tokensOut;
          }
        }
      }
    }

    // Flush any trailing buffered line (some Ollama versions omit the final newline)
    if (buffer.trim()) {
      try {
        const chunk = JSON.parse(buffer.trim()) as OllamaChatChunk;
        for (const event of handleChunk(chunk)) {
          yield event;
        }
      } catch {
        // ignore malformed tail
      }
    }

    yield* finish();
  }

  /**
   * Non-streaming convenience API: drains {@link stream} and assembles the
   * full content, tool calls, and token usage into a single result. Kept as
   * a thin adapter over the stream so there is exactly one wire-format
   * parsing path to maintain.
   */
  async complete(request: LlmChatRequest): Promise<LlmCompleteResult> {
    const contentParts: string[] = [];
    const toolCalls: LlmToolCall[] = [];
    let tokensIn: number | undefined;
    let tokensOut: number | undefined;

    for await (const event of this.stream(request)) {
      if (event.type === "text-delta") contentParts.push(event.text);
      if (event.type === "tool_call") toolCalls.push(event.toolCall);
      if (event.type === "usage") {
        tokensIn = event.tokensIn;
        tokensOut = event.tokensOut;
      }
    }

    return {
      content: contentParts.join(""),
      toolCalls,
      tokensIn,
      tokensOut,
    };
  }
}

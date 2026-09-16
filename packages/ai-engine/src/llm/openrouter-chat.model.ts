/**
 * OpenRouter chat model — OpenAI-compatible chat completions endpoint.
 *
 * OpenRouter provides routing across dozens of LLM providers with a single
 * API.  See https://openrouter.ai/docs/api-reference/chat-completion.
 *
 * Authentication: Bearer token in `Authorization` header.
 */

import {
  type ChatModel,
  type ChatModelConfig,
  LlmConnectionError,
  type LlmChatRequest,
  type LlmCompleteResult,
  type LlmStreamEvent,
  type LlmToolCall,
  type LlmToolDefinition,
  type OpenAiStyleToolCall,
} from "./types";

interface OpenRouterStreamChunk {
  id?: string;
  choices?: Array<{
    index?: number;
    delta?: {
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

/** Convert tool calls that arrived in a single chunk into neutral LlmToolCall[] */
function toToolCalls(chunk: OpenRouterStreamChunk): LlmToolCall[] {
  const calls: LlmToolCall[] = [];
  for (const choice of chunk.choices ?? []) {
    for (const tc of choice.delta?.tool_calls ?? []) {
      calls.push({
        id: tc.id ?? `call_${tc.index ?? 0}`,
        name: tc.function?.name ?? "",
        arguments: tc.function?.arguments ?? "",
      });
    }
  }
  return calls;
}

/** Build OpenAI-compatible tool definitions from neutral LlmToolDefinition[]. */
function toOpenAiTools(tools: LlmToolDefinition[]) {
  return tools.map((t) => ({
    type: "function" as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

export class OpenRouterChatModel implements ChatModel {
  readonly provider = "openrouter";

  constructor(private readonly config: ChatModelConfig) {}

  get model(): string {
    return this.config.model;
  }

  private endpoint(): string {
    return `${this.config.baseUrl.replace(/\/+$/, "")}${this.config.apiPath}`;
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
    };
  }

  /** Shared request body for both streaming and non-streaming calls. */
  private buildBody(request: LlmChatRequest, stream: boolean): string {
    return JSON.stringify({
      model: this.config.model,
      messages: request.messages,
      stream,
      ...(request.tools?.length ? { tools: toOpenAiTools(request.tools) } : {}),
      ...(stream ? { stream_options: { include_usage: true } } : {}),
    });
  }

  private async openStream(request: LlmChatRequest): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(this.endpoint(), {
        method: "POST",
        headers: this.headers(),
        body: this.buildBody(request, true),
      });
    } catch (err) {
      throw new LlmConnectionError(`Cannot reach OpenRouter: ${(err as Error).message}`);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new LlmConnectionError(
        `OpenRouter error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`,
      );
    }
    return response;
  }

  async *stream(request: LlmChatRequest): AsyncIterable<LlmStreamEvent> {
    const response = await this.openStream(request);
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const json = trimmed.slice(5).trim();
        if (json === "[DONE]") continue;

        let chunk: OpenRouterStreamChunk;
        try {
          chunk = JSON.parse(json) as OpenRouterStreamChunk;
        } catch {
          continue;
        }

        for (const choice of chunk.choices ?? []) {
          if (choice.delta?.content) {
            yield { type: "text-delta", text: choice.delta.content };
          }
          for (const tc of toToolCalls(chunk)) {
            yield { type: "tool_call", toolCall: tc };
          }
        }

        if (chunk.usage) {
          yield {
            type: "usage",
            tokensIn: chunk.usage.prompt_tokens ?? 0,
            tokensOut: chunk.usage.completion_tokens ?? 0,
          };
        }
      }
    }

    yield { type: "done" };
  }

  async complete(request: LlmChatRequest): Promise<LlmCompleteResult> {
    let response: Response;
    try {
      response = await fetch(this.endpoint(), {
        method: "POST",
        headers: this.headers(),
        body: this.buildBody(request, false),
      });
    } catch (err) {
      throw new LlmConnectionError(`Cannot reach OpenRouter: ${(err as Error).message}`);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new LlmConnectionError(
        `OpenRouter error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string; tool_calls?: OpenAiStyleToolCall[] } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const message = data.choices?.[0]?.message;
    const toolCalls: LlmToolCall[] = (message?.tool_calls ?? []).map((tc) => ({
      id: tc.id ?? "",
      name: tc.function?.name ?? "",
      arguments:
        typeof tc.function?.arguments === "string"
          ? tc.function.arguments
          : JSON.stringify(tc.function?.arguments ?? {}),
    }));

    return {
      content: message?.content ?? "",
      toolCalls,
      tokensIn: data.usage?.prompt_tokens,
      tokensOut: data.usage?.completion_tokens,
    };
  }
}

/**
 * Google AI Studio chat model — OpenAI-compatible chat completions endpoint.
 *
 * Google AI Studio provides access to Gemini models via an OpenAI-compatible
 * API.  See https://ai.google.dev/gemini-api/docs/openai.
 *
 * Authentication: API key passed as query parameter `key` or in the
 * `x-goog-api-key` header.
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

interface GoogleStreamChunk {
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

function toToolCalls(chunk: GoogleStreamChunk): LlmToolCall[] {
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

function toOpenAiTools(tools: LlmToolDefinition[]) {
  return tools.map((t) => ({
    type: "function" as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

export class GoogleAiStudioChatModel implements ChatModel {
  readonly provider = "google-ai-studio";

  constructor(private readonly config: ChatModelConfig) {}

  get model(): string {
    return this.config.model;
  }

  private endpoint(): string {
    const base = this.config.baseUrl.replace(/\/+$/, "");
    return `${base}${this.config.apiPath}`;
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      // Gemini's OpenAI-compatible endpoint accepts the API key as a Bearer
      // token (works for both standard "AIza..." AI Studio keys and OAuth /
      // Vertex-style tokens). See https://ai.google.dev/gemini-api/docs/openai.
      ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
    };
  }

  private buildBody(request: LlmChatRequest, stream: boolean): string {
    return JSON.stringify({
      model: this.config.model,
      messages: request.messages,
      stream,
      ...(request.tools?.length ? { tools: toOpenAiTools(request.tools) } : {}),
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
      throw new LlmConnectionError(`Cannot reach Google AI Studio: ${(err as Error).message}`);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new LlmConnectionError(
        `Google AI Studio error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`,
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

        let chunk: GoogleStreamChunk;
        try {
          chunk = JSON.parse(json) as GoogleStreamChunk;
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
      throw new LlmConnectionError(`Cannot reach Google AI Studio: ${(err as Error).message}`);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new LlmConnectionError(
        `Google AI Studio error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`,
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

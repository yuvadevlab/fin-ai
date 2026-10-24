/**
 * @file packages/ai-engine/src/llm/devlab-chat.model.ts
 * @description ChatModel adapter backed by the canonical @yuva-devlab/ai-client provider layer.
 * @module @finai/ai-engine/llm
 */

import { MessageRole, type ILLMProvider, type AIMessage } from "@yuva-devlab/ai-client";
import type {
  ChatModel,
  LlmChatRequest,
  LlmCompleteResult,
  LlmRole,
  LlmStreamEvent,
} from "./types";

/**
 * Maps FinAI lowercase message roles to canonical DevLab uppercase MessageRole enum values.
 *
 * @param role - FinAI role string
 * @returns Standardized DevLab MessageRole enum value
 */
function mapToDevLabRole(role: LlmRole): (typeof MessageRole)[keyof typeof MessageRole] {
  switch (role) {
    case "system":
      return MessageRole.SYSTEM;
    case "user":
      return MessageRole.USER;
    case "assistant":
      return MessageRole.ASSISTANT;
    case "tool":
      return MessageRole.TOOL;
    default:
      return MessageRole.USER;
  }
}

/**
 * Adapter class wrapping any DevLab ILLMProvider (Ollama, Groq, Google, OpenAI, FallbackCascade)
 * to satisfy FinAI's ChatModel interface.
 */
export class DevLabChatModel implements ChatModel {
  public readonly provider: string;
  public readonly model: string;
  private readonly client: ILLMProvider;

  /**
   * Constructs a DevLabChatModel instance.
   *
   * @param provider - Provider identifier string
   * @param model - Target model identifier name
   * @param client - Canonical @yuva-devlab/ai-client provider instance
   */
  constructor(provider: string, model: string, client: ILLMProvider) {
    this.provider = provider;
    this.model = model;
    this.client = client;
  }

  /**
   * Executes a full blocking completion request.
   *
   * @param request - FinAI chat request containing messages and optional tool descriptors
   * @returns Complete model completion result
   */
  public async complete(request: LlmChatRequest): Promise<LlmCompleteResult> {
    // Map FinAI message contracts to canonical DevLab AIMessage payloads
    const messages: AIMessage[] = request.messages.map((m) => ({
      role: mapToDevLabRole(m.role),
      content: m.content,
    }));

    const response = await this.client.complete({
      model: this.model,
      messages,
      temperature: 0.7,
      responseFormat: "text",
      timeoutMs: 30_000,
    });

    return {
      content: response.text,
      toolCalls: [],
      tokensIn: response.usage?.promptTokens,
      tokensOut: response.usage?.completionTokens,
    };
  }

  /**
   * Executes a streaming completion yielding token deltas in real-time.
   *
   * @param request - FinAI chat request
   * @returns Async iterable yielding LlmStreamEvent chunks
   */
  public async *stream(request: LlmChatRequest): AsyncIterable<LlmStreamEvent> {
    const messages: AIMessage[] = request.messages.map((m) => ({
      role: mapToDevLabRole(m.role),
      content: m.content,
    }));

    for await (const chunk of this.client.stream({
      model: this.model,
      messages,
      temperature: 0.7,
      responseFormat: "text",
      timeoutMs: 30_000,
    })) {
      // Yield text delta if present in chunk
      if (chunk.delta) {
        yield { type: "text-delta", text: chunk.delta };
      }
    }

    // Terminal completion event
    yield { type: "done" };
  }
}

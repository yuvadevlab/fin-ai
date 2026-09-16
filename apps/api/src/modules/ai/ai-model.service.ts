/**
 * Provider-agnostic AI model service.
 *
 * Wraps the {@link ChatModel} abstraction from `@finai/ai-engine` and
 * adapts it to the SSE streaming and simple chat patterns used by the
 * legacy AI Advisor controller.
 *
 * The provider is selected at runtime via `AI_PROVIDER` env var, supporting
 * Ollama, OpenRouter, Groq, and Google AI Studio.
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@finai/logger";
import {
  createChatModelFromEnv,
  type ChatModel,
  type LlmChatRequest,
  type LlmMessage,
} from "@finai/ai-engine";
import { Response } from "express";

export interface AiModelStreamOptions {
  /** Override the model for this specific request. */
  model?: string;
  prompt: string;
  systemPrompt?: string;
  historyMessages?: { role: string; content: string }[];
}

@Injectable()
export class AiModelService {
  private readonly logger = new Logger(AiModelService.name);
  private readonly model: ChatModel;

  constructor() {
    // All provider wiring (BASE_URL / API_PATH / keys / models) comes from
    // process.env — ConfigModule loads .env at boot, so new env vars flow
    // through without editing this file. Tests inject via process.env.
    const env: Record<string, string | undefined> = { ...process.env };
    this.model = createChatModelFromEnv(env, "chat");
    this.logger.log(`AI provider [chat]: ${this.model.provider} (${this.model.model})`);
  }

  /** Convert legacy options into the provider-agnostic LlmChatRequest. */
  private toRequest(options: AiModelStreamOptions): LlmChatRequest {
    const messages: LlmMessage[] = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    for (const msg of options.historyMessages ?? []) {
      const role = msg.role === "assistant" ? "assistant" : "user";
      messages.push({ role, content: msg.content });
    }
    messages.push({ role: "user", content: options.prompt });
    return { messages };
  }

  /**
   * Streams a chat response to an SSE `res` and invokes `onToken`
   * for each text token (used to accumulate the full response for persistence).
   */
  async streamChatWithCallback(
    options: AiModelStreamOptions,
    res: Response,
    onToken?: (token: string) => void,
  ): Promise<void> {
    const request = this.toRequest(options);
    this.logger.log(`[Stream] Started via ${this.model.provider} (${this.model.model})`);
    let error: Error | undefined;

    try {
      for await (const event of this.model.stream(request)) {
        switch (event.type) {
          case "text-delta":
            onToken?.(event.text);
            res.write(`data: ${JSON.stringify({ token: event.text })}\n\n`);
            break;
          case "tool_call":
            // Tool calls are surfaced as structured events (agentic mode handles these)
            res.write(`data: ${JSON.stringify({ toolCall: event.toolCall })}\n\n`);
            break;
          case "usage":
            res.write(
              `data: ${JSON.stringify({ usage: { tokensIn: event.tokensIn, tokensOut: event.tokensOut } })}\n\n`,
            );
            break;
          case "done":
            this.logger.log(`[Stream] Finished via ${this.model.provider} (${this.model.model})`);
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
            return;
        }
      }

      // Stream ended without explicit "done" — flush terminal events
      this.logger.log(`[Stream] Ended via ${this.model.provider} (${this.model.model})`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      error = err as Error;
      this.logger.error(`${this.model.provider} streaming error`, error);
      res.write(
        `data: ${JSON.stringify({
          error: `${this.model.provider} service unavailable. ${error.message}`,
        })}\n\n`,
      );
      res.end();
    }
  }

  /** Non-streaming chat response. */
  async chat(options: AiModelStreamOptions): Promise<string> {
    const request = this.toRequest(options);
    this.logger.log(
      `[Complete] Invoking completion via ${this.model.provider} (${this.model.model})`,
    );
    const result = await this.model.complete(request);
    return result.content;
  }
}

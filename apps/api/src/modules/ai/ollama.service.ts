import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

export interface OllamaStreamOptions {
  /** Override the model for this specific request. Falls back to OLLAMA_MODEL env var. */
  model?: string;
  prompt: string;
  systemPrompt?: string;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(configService: ConfigService) {
    this.baseUrl = configService.get<string>("OLLAMA_BASE_URL", "http://localhost:11434");
    this.model = configService.get<string>("OLLAMA_MODEL", "qwen3:8b");
  }

  /**
   * Streams an Ollama chat response to an SSE `res` and invokes `onToken`
   * for each text token (used to accumulate the full response for persistence).
   */
  async streamChatWithCallback(
    options: OllamaStreamOptions,
    res: Response,
    onToken?: (token: string) => void,
  ): Promise<void> {
    const { prompt, systemPrompt, model = this.model } = options;

    const body = JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      stream: true,
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const token = parsed.message?.content ?? "";
            if (token) {
              onToken?.(token);
              res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
            if (parsed.done) {
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              res.end();
              return;
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      this.logger.error("Ollama streaming error", error);
      res.write(
        `data: ${JSON.stringify({ error: "AI service unavailable. Make sure Ollama is running." })}\n\n`,
      );
      res.end();
    }
  }

  /**
   * Non-streaming chat response from Ollama.
   */
  async chat(options: OllamaStreamOptions): Promise<string> {
    const { prompt, systemPrompt, model = this.model } = options;

    const body = JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      stream: false,
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { message?: { content: string } };
      return data.message?.content ?? "";
    } catch (error) {
      this.logger.error("Ollama chat error", error);
      throw new Error("AI service unavailable");
    }
  }

  /** @deprecated Use streamChatWithCallback instead */
  async streamChat(options: OllamaStreamOptions, res: Response): Promise<void> {
    return this.streamChatWithCallback(options, res);
  }
}

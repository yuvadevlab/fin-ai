import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

export interface OllamaStreamOptions {
  model: string;
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
    this.model = configService.get<string>("OLLAMA_MODEL", "gemma3");
  }

  async streamChat(options: OllamaStreamOptions, res: Response): Promise<void> {
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
      res.write(`data: ${JSON.stringify({ error: "AI service unavailable" })}\n\n`);
      res.end();
    }
  }
}

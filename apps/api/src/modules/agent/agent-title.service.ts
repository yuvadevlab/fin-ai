/**
 * @file apps/api/src/modules/agent/agent-title.service.ts
 * @description Asynchronous LLM title generation service for new conversation threads.
 * @module @finai/api/modules/agent/agent-title.service
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { buildTitleGenerationPrompt, sanitizeConversationTitle } from "@finai/ai-engine";
import { ConversationService } from "@/modules/ai/conversation.service";
import { AgentStreamEventType } from "@finai/shared-types";
import { AgentModelFactory } from "./runners";
import type { AgentEventEmitter } from "./agent.types";

/**
 * Service dedicated to generating concise conversation thread titles using fast model inference.
 */
@Injectable()
export class AgentTitleService {
  private readonly logger = new Logger(AgentTitleService.name);

  constructor(
    private readonly conversationService: ConversationService,
    private readonly modelFactory: AgentModelFactory,
  ) {}

  /**
   * Generates a concise 3-6 word summary title asynchronously for a newly created conversation.
   *
   * @param conversationId - Target conversation UUID.
   * @param question - The initial user prompt.
   * @param emit - Server-Sent Event emitter to notify the client in real-time.
   */
  generateTitleAsync(conversationId: string, question: string, emit: AgentEventEmitter): void {
    Promise.resolve().then(async () => {
      try {
        this.logger.info(
          `[generateTitleAsync] Generating title for convo ${conversationId.slice(0, 8)}`,
        );
        const fastModel = this.modelFactory.createFastModel();
        const prompt = buildTitleGenerationPrompt(question);
        const res = await fastModel.complete({
          messages: [{ role: "user", content: prompt }],
        });
        const title = sanitizeConversationTitle(res.content, question);
        await this.conversationService.updateTitle(conversationId, title);
        emit({ type: AgentStreamEventType.TITLE, title });
        this.logger.info(
          `[generateTitleAsync] Title generated for convo ${conversationId.slice(0, 8)}: "${title}"`,
        );
      } catch (err) {
        this.logger.warn(
          `[generateTitleAsync] Failed title generation for convo ${conversationId.slice(0, 8)}: ${err}`,
        );
      }
    });
  }
}

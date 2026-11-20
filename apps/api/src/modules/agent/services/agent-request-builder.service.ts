import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import {
  buildToolPlanInstructions,
  resolveAiProvider,
  type LlmChatRequest,
  type LlmMessage,
} from "@fin-ai/ai-engine";
import { buildAgentSystemPrompt } from "@fin-ai/prompts";
import { ContextBuilderService } from "@/modules/ai/context-builder.service";
import { ConversationService } from "@/modules/ai/conversation.service";
import { ToolRegistry } from "../tool-registry";
import { ActionManager } from "../action-manager";
import { EntityMemoryService } from "../entity-memory";
import { serverTodayISO } from "../date.utils";
import { buildPendingActionSection, SHARED_WORKSPACE_AGENT_NOTICE } from "../utils";
import { AiProvider, AiProviderRole, LlmRole, MessageRole } from "@fin-ai/shared-types";
import type { AgentWorkspaceContext } from "../agent.types";

interface ProviderContextLimits {
  historyWindow: number;
  maxRecentTxns: number;
}

/**
 * Dynamically resolves context sizing limits based on active LLM provider limits.
 */
function resolveProviderContextLimits(): ProviderContextLimits {
  try {
    const provider = resolveAiProvider(process.env, AiProviderRole.AGENT);
    switch (provider) {
      case AiProvider.GROQ:
        // Groq enforces strict token-per-minute limits (8,000 TPM on free tier)
        return { historyWindow: 8, maxRecentTxns: 12 };
      case AiProvider.OLLAMA:
        // Local inference engines
        return { historyWindow: 12, maxRecentTxns: 20 };
      case AiProvider.GOOGLE_AI_STUDIO:
      case AiProvider.OPENROUTER:
      case AiProvider.CLINE:
        // High TPM / large context windows
        return { historyWindow: 20, maxRecentTxns: 30 };
      default:
        return { historyWindow: 12, maxRecentTxns: 25 };
    }
  } catch {
    return { historyWindow: 12, maxRecentTxns: 25 };
  }
}

export interface ChatRequestAssembly {
  request: LlmChatRequest;
  pendingAction: Awaited<ReturnType<ActionManager["getPendingAction"]>>;
  needsTools: boolean;
}

/**
 * Encapsulates the multi-turn context assembly for agent interactions.
 * Gathers conversation history, financial snapshot, entity memories, and system prompts.
 */
@Injectable()
export class AgentRequestBuilderService {
  private readonly logger = new Logger(AgentRequestBuilderService.name);

  constructor(
    private readonly registry: ToolRegistry,
    private readonly conversationService: ConversationService,
    private readonly contextBuilder: ContextBuilderService,
    private readonly actionManager: ActionManager,
    private readonly entityMemory: EntityMemoryService,
  ) {}

  async build(
    userId: string,
    conversationId: string,
    wsContext?: AgentWorkspaceContext,
  ): Promise<ChatRequestAssembly> {
    this.logger.info(`[build] Building context for convo ${conversationId.slice(0, 8)}`);

    const limits = resolveProviderContextLimits();
    const recent = await this.conversationService.getRecentMessages(
      conversationId,
      limits.historyWindow,
    );
    const pendingAction = await this.actionManager.getPendingAction(conversationId, userId);

    const history: LlmMessage[] = recent.reverse().map((m) => ({
      role: m.role === MessageRole.ASSISTANT ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    const snapshot = await this.contextBuilder.buildFinanceContext(
      userId,
      wsContext?.workspaceId,
      wsContext?.memberUserIds,
      { maxRecentTxns: limits.maxRecentTxns },
    );
    const entityMemoryData = await this.entityMemory.load(conversationId);
    let systemPrompt = buildAgentSystemPrompt({
      portfolioSnapshot: snapshot,
      toolPlanInstructions: buildToolPlanInstructions(this.registry.list().map((t) => t.name)),
      currentDate: serverTodayISO(),
      entityMemory: this.entityMemory.buildPromptSection(entityMemoryData),
      pendingAction: pendingAction
        ? buildPendingActionSection(pendingAction.id, pendingAction.tool, pendingAction.input)
        : "",
    });

    if (wsContext?.isReadOnly) {
      systemPrompt += `\n\n${SHARED_WORKSPACE_AGENT_NOTICE}`;
    }

    return {
      request: {
        messages: [{ role: LlmRole.SYSTEM, content: systemPrompt }, ...history],
        tools: this.registry.toLlmDefinitions(),
      },
      pendingAction,
      needsTools: true,
    };
  }
}

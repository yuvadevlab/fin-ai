import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { buildToolPlanInstructions, type LlmChatRequest, type LlmMessage } from "@finai/ai-engine";
import { buildAgentSystemPrompt } from "@finai/prompts";
import { ContextBuilderService } from "@/modules/ai/context-builder.service";
import { ConversationService } from "@/modules/ai/conversation.service";
import { ToolRegistry } from "../tool-registry";
import { ActionManager } from "../action-manager";
import { EntityMemoryService } from "../entity-memory";
import { serverTodayISO } from "../date.utils";
import { buildPendingActionSection, SHARED_WORKSPACE_AGENT_NOTICE } from "../utils";
import { LlmRole, MessageRole } from "@finai/shared-types";
import type { AgentWorkspaceContext } from "../agent.types";

const HISTORY_WINDOW = 12;

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

    const recent = await this.conversationService.getRecentMessages(conversationId, HISTORY_WINDOW);
    const pendingAction = await this.actionManager.getPendingAction(conversationId, userId);

    const history: LlmMessage[] = recent.reverse().map((m) => ({
      role: m.role === MessageRole.ASSISTANT ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    const snapshot = await this.contextBuilder.buildFinanceContext(
      userId,
      wsContext?.workspaceId,
      wsContext?.memberUserIds,
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

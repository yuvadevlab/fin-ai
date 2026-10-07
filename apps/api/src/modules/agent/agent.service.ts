/**
 * @file apps/api/src/modules/agent/agent.service.ts
 * @description Autonomous Financial Agent Orchestration Service.
 * Coordinates conversation state, dynamic system prompts, tool execution, and SSE streaming.
 * @module @finai/api/modules/agent/agent.service
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { randomUUID } from "crypto";
import {
  buildAgentSystemPrompt,
  buildToolPlanInstructions,
  LlmConnectionError,
  type LlmChatRequest,
  type LlmMessage,
} from "@finai/ai-engine";
import type { AgentChatInput } from "@finai/validation";
import { AccountsService } from "@/modules/accounts/accounts.service";
import { AnalyticsService } from "@/modules/analytics/analytics.service";
import { SearchService } from "@/modules/search/search.service";
import { TransactionsService } from "@/modules/transactions/transactions.service";
import { CategoriesService } from "@/modules/categories/categories.service";
import { BudgetsService } from "@/modules/budgets/budgets.service";
import { GoalsService } from "@/modules/goals/goals.service";
import { InvestmentsService } from "@/modules/investments/investments.service";
import { UsersService } from "@/modules/auth/users.service";
import { ContextBuilderService } from "@/modules/ai/context-builder.service";
import { ConversationService } from "@/modules/ai/conversation.service";
import { ToolRegistry } from "./tool-registry";
import { AgentActionService } from "./action.service";
import { ActionManager } from "./action-manager";
import { EntityMemoryService } from "./entity-memory";
import { serverTodayISO } from "./date.utils";
import { AgentOrchestratorService } from "./runners";
import { buildAgentTools } from "./tool-factory";
import { buildPendingActionSection } from "./utils";
import {
  AgentStreamEventType,
  AgentMode,
  ExecutionPhase,
  PhaseStatus,
  MessageRole,
} from "@finai/shared-types";
import { AgentTitleService } from "./agent-title.service";
import type { AgentEventEmitter } from "./agent.types";

/** Maximum number of previous messages to assemble into the conversation context window */
const HISTORY_WINDOW = 12;

/**
 * Orchestrator facade for autonomous conversational money assistance.
 * Manages chat lifecycle, dynamic prompt assembly, fast title generation, and execution.
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly registry: ToolRegistry,
    private readonly conversationService: ConversationService,
    private readonly contextBuilder: ContextBuilderService,
    private readonly actionService: AgentActionService,
    private readonly actionManager: ActionManager,
    private readonly entityMemory: EntityMemoryService,
    private readonly orchestrator: AgentOrchestratorService,
    private readonly titleService: AgentTitleService,
    accountsService: AccountsService,
    analyticsService: AnalyticsService,
    searchService: SearchService,
    transactionsService: TransactionsService,
    categoriesService: CategoriesService,
    budgetsService: BudgetsService,
    goalsService: GoalsService,
    investmentsService: InvestmentsService,
    usersService: UsersService,
  ) {
    const tools = buildAgentTools({
      accountsService,
      analyticsService,
      searchService,
      transactionsService,
      categoriesService,
      budgetsService,
      goalsService,
      investmentsService,
      usersService,
      actionManager,
      actionService,
    });
    for (const tool of tools) this.registry.register(tool);
  }

  /**
   * Assembles the multi-turn LLM request including system instructions, memory, and history.
   *
   * @param userId - Unique identifier of the authenticated user.
   * @param conversationId - The active conversation thread UUID.
   * @returns The assembled LLM chat payload, pending action metadata, and tool configuration.
   */
  private async buildChatRequest(
    userId: string,
    conversationId: string,
  ): Promise<{
    request: LlmChatRequest;
    pendingAction: Awaited<ReturnType<ActionManager["getPendingAction"]>>;
    needsTools: boolean;
  }> {
    this.logger.info(`[buildChatRequest] Building context for convo ${conversationId.slice(0, 8)}`);

    // 1. Fetch recent chronological messages and pending human-in-the-loop actions
    const recent = await this.conversationService.getRecentMessages(conversationId, HISTORY_WINDOW);
    const pendingAction = await this.actionManager.getPendingAction(conversationId, userId);

    // 2. Map stored database messages to LLM chat turn messages
    const history: LlmMessage[] = recent.reverse().map((m) => ({
      role: m.role === MessageRole.ASSISTANT ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    // 3. Assemble financial snapshot, memory, and system instructions
    const snapshot = await this.contextBuilder.buildFinanceContext(userId);
    const entityMemoryData = await this.entityMemory.load(conversationId);
    const systemPrompt = buildAgentSystemPrompt({
      portfolioSnapshot: snapshot,
      toolPlanInstructions: buildToolPlanInstructions(this.registry.list().map((t) => t.name)),
      currentDate: serverTodayISO(),
      entityMemory: this.entityMemory.buildPromptSection(entityMemoryData),
      pendingAction: pendingAction
        ? buildPendingActionSection(pendingAction.id, pendingAction.tool, pendingAction.input)
        : "",
    });

    return {
      request: {
        messages: [{ role: "system", content: systemPrompt }, ...history],
        tools: this.registry.toLlmDefinitions(),
      },
      pendingAction,
      needsTools: true,
    };
  }

  /**
   * Executes an autonomous conversational turn using the ReAct agent framework.
   *
   * @param input - Client input containing question and optional conversation ID.
   * @param userId - Authenticated user UUID.
   * @param emit - SSE callback emitting streaming tokens, tool states, and approval cards.
   */
  async chat(input: AgentChatInput, userId: string, emit: AgentEventEmitter): Promise<void> {
    const runId = randomUUID();
    emit({ type: AgentStreamEventType.RUN, runId });

    let conversationId = input.conversationId;
    let isNewConversation = false;

    // Resolve or initialize conversation thread
    if (conversationId) {
      const existing = await this.conversationService.getConversation(conversationId, userId);
      if (!existing) {
        this.logger.warn(`[chat] Conversation not found: ${conversationId.slice(0, 8)}`);
        emit({
          type: AgentStreamEventType.ERROR,
          error: "Conversation not found",
          code: "CONVERSATION_NOT_FOUND",
        });
        emit({ type: AgentStreamEventType.DONE });
        return;
      }
    } else {
      const convo = await this.conversationService.createConversation(
        userId,
        input.question.slice(0, 80),
      );
      conversationId = convo.id;
      isNewConversation = true;
    }

    this.logger.info(
      `[chat] User ${userId.slice(0, 8)}: "${input.question.slice(0, 50)}" (convo: ${conversationId.slice(0, 8)}, runId: ${runId.slice(0, 8)})`,
    );
    emit({ type: AgentStreamEventType.CONVERSATION, conversationId });

    // Non-blocking fast model summary title generation for new threads
    if (isNewConversation) {
      this.titleService.generateTitleAsync(conversationId, input.question, emit);
    }

    try {
      // 1. Record incoming user turn to database
      await this.conversationService.addMessage(conversationId, "user", input.question);

      // 2. Assemble context snapshot and notify client
      emit({
        type: AgentStreamEventType.PHASE,
        phase: ExecutionPhase.LOADING_CONTEXT,
        status: PhaseStatus.START,
      });
      const { request, pendingAction, needsTools } = await this.buildChatRequest(
        userId,
        conversationId,
      );
      emit({
        type: AgentStreamEventType.PHASE,
        phase: ExecutionPhase.LOADING_CONTEXT,
        status: PhaseStatus.END,
      });
      emit({
        type: AgentStreamEventType.MODE,
        mode: needsTools ? AgentMode.AGENT : AgentMode.CHAT,
      });

      // 3. Delegate to ReAct orchestrator service for iterative tool execution
      await this.orchestrator.run({
        userId,
        conversationId,
        runId,
        request,
        hasPendingAction: Boolean(pendingAction),
        emit,
        role: needsTools ? AgentMode.AGENT : AgentMode.CHAT,
      });
    } catch (error) {
      this.logger.error(
        `[chat] Agent run ${runId.slice(0, 8)} failed: ${(error as Error).message}`,
      );
      emit({
        type: AgentStreamEventType.ERROR,
        error:
          error instanceof LlmConnectionError
            ? error.message
            : "The agent could not complete this request. Please try again.",
        code: error instanceof LlmConnectionError ? "LLM_UNAVAILABLE" : "AGENT_ERROR",
      });
      emit({ type: AgentStreamEventType.DONE });
    }
  }
}

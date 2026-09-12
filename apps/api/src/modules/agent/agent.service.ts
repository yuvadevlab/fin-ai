import { Injectable } from "@nestjs/common";
import { Logger } from "@finai/logger";
import { randomUUID } from "crypto";
import {
  buildAgentSystemPrompt,
  buildToolFreeAgentPrompt,
  buildToolPlanInstructions,
  requiresAgentTools,
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
import type { AgentEventEmitter } from "./agent.types";

/** How many recent messages to replay as chat history. */
const HISTORY_WINDOW = 12;

/**
 * Agent orchestrator facade: Owns conversation lifecycle, system prompt assembly,
 * and delegates execution to AgentOrchestratorService.
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

  /** Assembles the initial LLM request, dynamically choosing tool-free vs agent prompt. */
  private async buildChatRequest(
    userId: string,
    conversationId: string,
    question: string,
  ): Promise<{
    request: LlmChatRequest;
    pendingAction: Awaited<ReturnType<ActionManager["getPendingAction"]>>;
    needsTools: boolean;
  }> {
    const recent = await this.conversationService.getRecentMessages(conversationId, HISTORY_WINDOW);
    const hasRecentToolCalls = recent.some(
      (m) =>
        m.role === "ASSISTANT" &&
        (m.content.includes("<tool_plan>") || m.content.includes("awaiting_confirmation")),
    );
    const pendingAction = await this.actionManager.getPendingAction(conversationId, userId);

    // Routing is fully automatic (fail-open intent router). A pending
    // confirmation always stays in the agent loop — the model must be able to
    // continue it. There is no client-side manual mode override.
    const needsTools = requiresAgentTools({
      question,
      hasPendingAction: Boolean(pendingAction),
      hasRecentToolCalls,
    });
    this.logger.log(
      `[AgentChat] Routing "${question.slice(0, 50)}" -> ${needsTools ? "agent (auto)" : "chat (auto)"}`,
    );

    const history: LlmMessage[] = recent.reverse().map((m) => ({
      role: m.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));
    const snapshot = await this.contextBuilder.buildFinanceContext(userId);

    if (!needsTools) {
      const systemPrompt = buildToolFreeAgentPrompt({
        portfolioSnapshot: snapshot,
        currentDate: serverTodayISO(),
      });
      return {
        request: { messages: [{ role: "system", content: systemPrompt }, ...history] },
        pendingAction,
        needsTools: false,
      };
    }

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

  /** Runs the full ReAct-style agent loop. */
  async chat(input: AgentChatInput, userId: string, emit: AgentEventEmitter): Promise<void> {
    const runId = randomUUID();
    emit({ type: "run", runId });

    let conversationId = input.conversationId;
    if (conversationId) {
      const existing = await this.conversationService.getConversation(conversationId, userId);
      if (!existing) {
        emit({ type: "error", error: "Conversation not found", code: "CONVERSATION_NOT_FOUND" });
        emit({ type: "done" });
        return;
      }
    } else {
      const convo = await this.conversationService.createConversation(
        userId,
        input.question.slice(0, 80),
      );
      conversationId = convo.id;
    }
    this.logger.log(
      `[AgentChat] User ${userId.slice(0, 8)}: "${input.question.slice(0, 60)}" (convo: ${conversationId}, runId: ${runId.slice(0, 8)})`,
    );
    emit({ type: "conversation", conversationId });

    try {
      await this.conversationService.addMessage(conversationId, "user", input.question);
      emit({ type: "phase", phase: "loading_context", status: "start" });
      const { request, pendingAction, needsTools } = await this.buildChatRequest(
        userId,
        conversationId,
        input.question,
      );
      emit({ type: "phase", phase: "loading_context", status: "end" });
      // Tell the client which runtime answered so the UI can surface it
      // (per-reply badge) — "agent" or "chat".
      emit({ type: "mode", mode: needsTools ? "agent" : "chat" });
      this.logger.log(
        `[AgentChat] Routed to role: ${needsTools ? "agent (tools)" : "chat (fast-path)"}`,
      );

      await this.orchestrator.run({
        userId,
        conversationId,
        runId,
        request,
        hasPendingAction: Boolean(pendingAction),
        emit,
        role: needsTools ? "agent" : "chat",
      });
    } catch (error) {
      this.logger.error(`Agent run ${runId} failed: ${(error as Error).message}`);
      emit({
        type: "error",
        error:
          error instanceof LlmConnectionError
            ? error.message
            : "The agent could not complete this request. Please try again.",
        code: error instanceof LlmConnectionError ? "LLM_UNAVAILABLE" : "AGENT_ERROR",
      });
      emit({ type: "done" });
    }
  }
}

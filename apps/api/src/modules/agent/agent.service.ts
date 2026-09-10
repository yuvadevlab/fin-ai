import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { Prisma } from "@finai/database";
import {
  buildAgentSystemPrompt,
  buildToolPlanInstructions,
  LlmConnectionError,
  type ChatModel,
  type LlmChatRequest,
  type LlmMessage,
  type LlmToolCall,
  OllamaChatModel,
  parseToolPlan,
  ToolPlanStreamFilter,
} from "@finai/ai-engine";
import { PrismaService } from "@/modules/prisma/prisma.service";
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
import { AuditService } from "./audit.service";
import { createAccountsTools } from "./tools/accounts.tools";
import { createAnalyticsTools } from "./tools/analytics.tools";
import { createSearchTools } from "./tools/search.tools";
import { createTransactionsTools } from "./tools/transactions.tools";
import { createTransactionsWriteTools } from "./tools/transactions.write.tools";
import { createTransactionRecordTools } from "./tools/transactions.record.tools";
import { createCategoriesTools } from "./tools/categories.tools";
import { createBudgetsTools } from "./tools/budgets.tools";
import { createGoalsTools } from "./tools/goals.tools";
import { createInvestmentsTools } from "./tools/investments.tools";
import { createInsightsTools } from "./tools/insights.tools";
import { createProfileTools } from "./tools/profile.tools";
import { createActionManagementTools } from "./tools/action-management.tools";
import type { AgentContext, AgentEventEmitter } from "./agent.types";
import { EntityMemoryService } from "./entity-memory";
import { extractEntitiesFromInput, extractEntitiesFromOutput } from "./entity-extractor";
import { serverTodayISO } from "./date.utils";

/**
 * Safety cap on the model↔tool reasoning loop (see `chat`). Each iteration is
 * one model turn; without a cap a confused model could ping-pong tool calls
 * forever, burning tokens and holding the SSE connection open. 6 turns is
 * enough for realistic multi-step requests (list → resolve → act) while
 * bounding worst-case latency and cost. When the cap is hit the user gets a
 * clear "too many steps" error instead of a silent hang.
 */
const MAX_ITERATIONS = 6;

/**
 * How many recent conversation messages are replayed to the model as chat
 * history. Old turns are dropped because the system prompt already carries
 * the distilled state (financial snapshot + entity memory), so replaying the
 * entire transcript would waste context window without adding information.
 * 12 messages ≈ the last 6 user/assistant exchanges, which covers follow-up
 * questions like "and what about last month?".
 */
const HISTORY_WINDOW = 12;

export interface AgentChatInput {
  /** The user's raw natural-language request (already authenticated). */
  question: string;
  /**
   * Existing conversation to continue. When omitted a new conversation is
   * created and its id is announced via a `conversation` stream event.
   */
  conversationId?: string;
}

/**
 * Outcome of a single model turn (one iteration of the agent loop).
 * `rawContent` is everything the model emitted (including <tool_plan> blocks),
 * while `visibleContent` is what was streamed to the user for THIS turn.
 */
interface ModelTurnResult {
  /** Full model output, kept verbatim for replaying into the message history. */
  rawContent: string;
  /** Model output with tool-plan blocks and unsafe prose filtered out. */
  visibleContent: string;
  /** Tool calls surfaced by native function calling (may be empty). */
  toolCalls: LlmToolCall[];
  /** Prompt tokens reported by Ollama for this turn (0 when unknown). */
  tokensIn: number;
  /** Generated tokens reported by Ollama for this turn (0 when unknown). */
  tokensOut: number;
}

/**
 * Agent orchestrator: ReAct-style loop over an Ollama chat model.
 * The LLM selects tools; every execution runs inside the authenticated
 * user's context through the existing domain services.
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  /**
   * Wires every domain tool into the registry.
   *
   * Tools are created eagerly at construction time by injecting the existing
   * NestJS domain services (accounts, transactions, budgets, …) into the
   * tool factory functions. This is the architectural bridge between the
   * agent and the application: tools are thin adapters over services the UI
   * already uses, so the agent can never do anything the app itself cannot.
   * Every tool also lands in the shared `ToolRegistry`, which enforces
   * unique names and exposes the LLM-facing definitions.
   */
  constructor(
    private readonly registry: ToolRegistry,
    private readonly conversationService: ConversationService,
    private readonly contextBuilder: ContextBuilderService,
    private readonly actionService: AgentActionService,
    private readonly actionManager: ActionManager,
    private readonly auditService: AuditService,
    private readonly entityMemory: EntityMemoryService,
    private readonly configService: ConfigService,

    private readonly prisma: PrismaService,
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
    for (const tool of [
      ...createAccountsTools(accountsService),
      ...createAnalyticsTools(analyticsService),
      ...createSearchTools(searchService),
      ...createTransactionsTools(transactionsService),
      ...createTransactionsWriteTools(transactionsService, accountsService, categoriesService),
      ...createTransactionRecordTools(transactionsService, accountsService, categoriesService),
      ...createCategoriesTools(categoriesService),
      ...createBudgetsTools(budgetsService),
      ...createGoalsTools(goalsService),
      ...createInvestmentsTools(investmentsService),
      ...createInsightsTools(analyticsService),
      ...createProfileTools(usersService, accountsService),
      ...createActionManagementTools(actionManager, actionService),
    ]) {
      this.registry.register(tool);
    }
  }

  /**
   * Builds a prompt section describing the pending (unconfirmed) action so the
   * LLM can interpret the user's next message as a correction to it.
   *
   * The section tells the LLM:
   *   - which action is pending (id, tool, current input)
   *   - to call `action.patch` with only the changed fields if the message is
   *     a correction
   *   - to call `action.confirm` if the user explicitly confirms
   *   - to ignore the pending action and process as a new request if the
   *     message is unrelated
   */
  private buildPendingActionPromptSection(actionId: string, tool: string, input: unknown): string {
    return [
      "## PENDING ACTION (awaiting the user's confirmation)",
      "",
      `There is an unconfirmed action the user is reviewing. Their next message may be a correction to it.`,
      "",
      `- Action ID: ${actionId}`,
      `- Tool: ${tool}`,
      `- Current input: ${JSON.stringify(input)}`,
      "",
      "If the user's message corrects or modifies this action (e.g. 'change the date to Sep 6', 'use HDFC instead', 'make it ₹550'), call `action.patch` with ONLY the fields that should change. Do NOT include unchanged fields. The action remains pending after patching — it is NOT executed.",
      "",
      "If the user explicitly confirms the action (e.g. 'confirm', 'yes', 'go ahead', 'looks good'), call `action.confirm` to execute it.",
      "",
      "If the user's message is an unrelated new request, ignore this pending action and process the message normally. The pending action will remain available for later confirmation.",
      "",
      "IMPORTANT: A conversational edit (action.patch) must NOT execute the action. Only action.confirm or the user clicking the confirm button executes it.",
    ].join("\n");
  }

  /**
   * Builds a fresh Ollama chat model client for this run.
   *
   * A new instance is created per run (rather than cached) so configuration
   * changes via env vars take effect without a process restart, and so no
   * mutable state leaks between concurrent user runs. Base URL and model
   * come from `OLLAMA_BASE_URL` / `OLLAMA_MODEL` with local defaults.
   */
  private createModel(): ChatModel {
    return new OllamaChatModel({
      baseUrl: this.configService.get<string>("OLLAMA_BASE_URL", "http://localhost:11434"),
      model: this.configService.get<string>("OLLAMA_MODEL", "qwen3:8b"),
    });
  }

  /**
   * Runs one full agent turn: the ReAct-style Reason→Act→Observe loop.
   *
   * Flow (this is the core of the agentic experience):
   *   1. Persist the user's message and load recent chat history.
   *   2. Load entity memory + live financial snapshot and build the system
   *      prompt (persona + grounding rules + tools + snapshot + memory).
   *   3. Loop up to MAX_ITERATIONS times:
   *        - stream one model turn,
   *        - collect tool calls (native tool calling, or the <tool_plan>
   *          JSON fallback parsed from raw output),
   *        - no tool calls  → this is the final answer: stream it, persist
   *          it, emit `done`, and stop;
   *        - tool calls     → execute each one, append the results to the
   *          message history as `tool` messages, and loop so the model can
   *          observe them;
   *        - if any call was a write proposal awaiting confirmation → stop
   *          the loop with the standardized confirmation message (the card
   *          in the UI is the source of truth).
   *
   * Every outcome path (answer, confirmation, max-iterations, error) emits a
   * terminal `done` event so the SSE connection is always closed cleanly.
   *
   * @param input  User question plus optional conversation to continue.
   * @param userId Authenticated user id — every tool executes with this
   *               identity, so the agent cannot read or write another
   *               user's data even if the model fabricates ids.
   * @param emit   Callback that publishes SSE events to the client.
   */
  async chat(input: AgentChatInput, userId: string, emit: AgentEventEmitter): Promise<void> {
    const runId = randomUUID();
    emit({ type: "run", runId });

    // Resolve (ownership-checked) or create the conversation
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
    emit({ type: "conversation", conversationId });

    const ctx: AgentContext = { userId, conversationId, runId };

    try {
      await this.conversationService.addMessage(conversationId, "user", input.question);

      // Real lifecycle event: the server is about to assemble grounding data
      // (conversation history, entity memory, financial snapshot, pending
      // action). This involves several DB round-trips and can take a moment,
      // so the client shows "Loading financial context…" while it happens.
      emit({ type: "phase", phase: "loading_context", status: "start" });

      const recent = await this.conversationService.getRecentMessages(
        conversationId,
        HISTORY_WINDOW,
      );
      const history: LlmMessage[] = recent.reverse().map((m) => ({
        role: m.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

      const entityMemory = await this.entityMemory.load(conversationId);
      const entityMemorySection = this.entityMemory.buildPromptSection(entityMemory);
      const snapshot = await this.contextBuilder.buildFinanceContext(userId);
      const toolPlanInstructions = buildToolPlanInstructions(
        this.registry.list().map((t) => t.name),
      );

      // Check for a pending (unconfirmed) action in this conversation. If one
      // exists, the user's message may be a correction to it — inject context
      // so the LLM can interpret it as a patch rather than a new request.
      const pendingAction = await this.actionManager.getPendingAction(conversationId, userId);
      const pendingActionSection = pendingAction
        ? this.buildPendingActionPromptSection(
            pendingAction.id,
            pendingAction.tool,
            pendingAction.input,
          )
        : "";

      const systemPrompt = buildAgentSystemPrompt({
        portfolioSnapshot: snapshot,
        toolPlanInstructions,
        currentDate: serverTodayISO(),
        entityMemory: entityMemorySection,
        pendingAction: pendingActionSection,
      });

      emit({ type: "phase", phase: "loading_context", status: "end" });

      const model = this.createModel();
      const request: LlmChatRequest = {
        messages: [{ role: "system", content: systemPrompt }, ...history],
        tools: this.registry.toLlmDefinitions(),
      };

      let tokensIn = 0;
      let tokensOut = 0;
      // Accumulates every visible token streamed during THIS run across all
      // model turns, so the persisted assistant message matches exactly what
      // the user watched stream in the UI. Replaced (not appended) by the
      // standardized grounded message when a confirmation supersedes the
      // streamed prose.
      let runVisibleContent = "";

      for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
        const turn = await this.runModelTurn(
          model,
          request,
          emit,
          iteration,
          Boolean(pendingAction),
        );
        tokensIn += turn.tokensIn;
        tokensOut += turn.tokensOut;
        runVisibleContent += turn.visibleContent;

        // Native tool calls first; JSON-plan fallback for models without function calling.
        let toolCalls = turn.toolCalls;
        if (toolCalls.length === 0) {
          toolCalls = parseToolPlan(turn.rawContent) ?? [];
        }

        // Real lifecycle: inference finished. Emitted HERE (not inside
        // runModelTurn) — after native calls AND the JSON-plan fallback have
        // been resolved — so `toolCalls` is the true count of what happens
        // next. 0 means the answer has already streamed; >0 means tool
        // steps are about to stream.
        emit({
          type: "phase",
          phase: "model_turn",
          status: "end",
          turn: iteration,
          pendingAction: Boolean(pendingAction),
          toolCalls: toolCalls.length,
        });

        if (toolCalls.length === 0) {
          // Final answer — its tokens already streamed live during the turn,
          // so there is nothing left to emit. Persist what the user saw.
          await this.finishRun(
            conversationId,
            model.model,
            runId,
            iteration,
            runVisibleContent,
            tokensIn,
            tokensOut,
            emit,
          );
          return;
        }

        // Execute tool calls and feed results back to the model.
        request.messages.push({ role: "assistant", content: turn.rawContent });
        let hasConfirmation = false;
        for (const call of toolCalls) {
          const result = await this.executeTool(call, ctx, emit);
          request.messages.push({
            role: "tool",
            toolName: call.name,
            content: `<tool_result tool="${call.name}">${JSON.stringify(result)}</tool_result>`,
          });
          if ((result as { status?: string }).status === "awaiting_confirmation") {
            hasConfirmation = true;
          }
        }

        // Grounding after live streaming: the prose for this turn streamed
        // BEFORE the tool ran and may hallucinate details the server resolved
        // differently. The confirmation card is the source of truth, so the
        // whole visible answer is replaced via `token_replace` (the client
        // swaps message text instead of appending — no duplicate message is
        // created). Breaking the loop here also prevents a follow-up model
        // turn that would otherwise hallucinate a summary of the action.
        if (hasConfirmation) {
          const standardized =
            "I've proposed an action for your confirmation. Please review the details on the card and confirm or reject.";
          emit({ type: "token_replace", content: standardized });
          await this.finishRun(
            conversationId,
            model.model,
            runId,
            iteration,
            standardized,
            tokensIn,
            tokensOut,
            emit,
          );
          return;
        }
        // Non-confirmation turns: prose already streamed live during the
        // turn — emitting it again here would duplicate it in the UI.
      }

      emit({
        type: "error",
        error: "The agent used too many steps for this request. Try narrowing the question.",
        code: "MAX_ITERATIONS",
      });
      emit({ type: "done" });
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

  /**
   * Persists the final assistant message and closes the run.
   *
   * `finalContent` is the exact text the user watched stream (accumulated
   * across this run's model turns, or the standardized grounded message when
   * a confirmation replaced streamed prose) — persisting it verbatim keeps a
   * page reload faithful to the live conversation. The message is first
   * written through ConversationService, then updated with run metadata
   * (model name, iteration count, token usage) directly via Prisma — this
   * metadata powers the per-message "how was this generated" debugging info
   * in the UI. Finally the accumulated token usage is emitted (only when
   * non-zero; Ollama omits counts on some fallback paths) followed by the
   * terminal `done` event.
   */
  private async finishRun(
    conversationId: string,
    modelName: string,
    runId: string,
    iterations: number,
    finalContent: string,
    tokensIn: number,
    tokensOut: number,
    emit: AgentEventEmitter,
  ): Promise<void> {
    const message = await this.conversationService.addMessage(
      conversationId,
      "assistant",
      finalContent,
    );
    await this.prisma.client.message.update({
      where: { id: message.id },
      data: {
        metadata: {
          runId,
          model: modelName,
          iterations,
          tokensIn,
          tokensOut,
        } as Prisma.InputJsonValue,
      },
    });
    if (tokensIn || tokensOut) {
      emit({ type: "usage", tokensIn, tokensOut });
    }
    emit({ type: "done" });
  }

  /**
   * Streams a single model turn and reduces the event soup into a
   * `ModelTurnResult`.
   *
   * TRUE STREAMING: every visible delta is forwarded to the client AS IT
   * ARRIVES via `emit({ type: "token" })` — the browser renders text
   * token-by-token while the model is still generating. `visibleContent`
   * still accumulates the same text server-side so the caller knows what the
   * user has seen (used for persistence and for the confirmation
   * `token_replace` decision below).
   *
   * Grounding vs streaming trade-off: prose is generated BEFORE tools
   * execute. If a write tool later requires confirmation, that prose may
   * hallucinate details contradicting the server-built card. Rather than
   * buffering the whole turn (which destroyed streaming UX), the caller
   * resolves this AFTER the fact with a `token_replace` event that swaps the
   * streamed text for the standardized grounded message.
   *
   * The `ToolPlanStreamFilter` hides <tool_plan> blocks from the visible
   * stream while `rawContent` still retains them for the JSON-plan fallback
   * parser. The filter may hold back text while a tag is split across chunks
   * (`push` returns "" for those deltas) — the flush tail is emitted too, so
   * no visible character is ever dropped.
   *
   * @param emit Publishes SSE events. The model turn emits REAL lifecycle
   *              `phase` events: `start` right before inference begins and
   *              `end` when the stream finishes (with the number of tool
   *              calls the model decided on). During long local Ollama
   *              inference this is the only signal the UI gets — it shows the
   *              user what the agent is actually doing instead of freezing.
   * @param turn 1-based iteration number (drives the user-facing label).
   * @param pendingAction Whether a confirmation is pending (turn 1 is then a
   *              correction to that action rather than a fresh request).
   */
  private async runModelTurn(
    model: ChatModel,
    request: LlmChatRequest,
    emit: AgentEventEmitter,
    turn: number,
    pendingAction: boolean,
  ): Promise<ModelTurnResult> {
    // Real lifecycle: inference is about to start. No tool is running at this
    // moment — the honest state is "the model is thinking", nothing more.
    emit({ type: "phase", phase: "model_turn", status: "start", turn, pendingAction });

    const filter = new ToolPlanStreamFilter();
    let rawContent = "";
    let visibleContent = "";
    let tokensIn = 0;
    let tokensOut = 0;
    const toolCalls: LlmToolCall[] = [];

    for await (const event of model.stream(request)) {
      switch (event.type) {
        case "text-delta": {
          rawContent += event.text;
          // Forward user-safe prose the moment it clears the tool-plan
          // filter. This is the exact point where "the user watches the
          // response being generated" becomes true.
          const visible = filter.push(event.text);
          if (visible) {
            visibleContent += visible;
            emit({ type: "token", content: visible });
          }
          break;
        }
        case "tool_call":
          toolCalls.push(event.toolCall);
          break;
        case "usage":
          tokensIn = event.tokensIn;
          tokensOut = event.tokensOut;
          break;
        case "done":
          break;
      }
    }

    // Flush whatever the filter held back (partial-tag tail, trailing prose).
    const tail = filter.flush();
    if (tail) {
      visibleContent += tail;
      emit({ type: "token", content: tail });
    }

    // NOTE: the `model_turn` end event is emitted by the orchestrator (`chat`)
    // AFTER native tool calls AND the JSON-plan fallback have been resolved,
    // so `toolCalls` there is the true count of what happens next. Emitting it
    // here as well would send a duplicate end frame with a less accurate
    // count, so this method only emits the `start` event.

    return { rawContent, visibleContent, toolCalls, tokensIn, tokensOut };
  }

  /**
   * Validates and executes a single tool call selected by the model.
   *
   * This is the safety choke-point between the LLM and user data:
   *   1. The tool must exist in the registry (unknown names are audited and
   *      reported back as an error the model can read).
   *   2. Arguments are Zod-validated against the tool's schema — malformed
   *      model output never reaches a domain service.
   *   3. The entities the call references are recorded into conversation
   *      entity memory (before execution so proposed writes carry their
   *      refs; after execution for reads/lists that return entities).
   *   4. Confirmation-required (write) tools do NOT execute. Instead a
   *      proposal is stored, a confirmation card is emitted, the proposal is
   *      audited, and an `awaiting_confirmation` result is returned so the
   *      orchestrator stops the loop. Actual execution happens later in
   *      `AgentActionService` only after the user confirms in the UI.
   *   5. Read tools execute immediately inside the authenticated user's
   *      context; failures are caught, audited, and surfaced to the model
   *      (never thrown) so the agent can explain the problem to the user.
   *
   * @returns A plain JSON object that is appended to the conversation as a
   *          `tool` result message — either `{ ok, data }`, or
   *          `{ ok: false, error }` (never throws).
   */
  private async executeTool(
    call: LlmToolCall,
    ctx: AgentContext,
    emit: AgentEventEmitter,
  ): Promise<Record<string, unknown>> {
    emit({ type: "tool_call", tool: call.name, runId: ctx.runId });

    const tool = this.registry.get(call.name);
    if (!tool) {
      await this.auditService.record({
        userId: ctx.userId,
        runId: ctx.runId,
        action: "tool.execute",
        tool: call.name,
        status: "error",
        metadata: { reason: "unknown_tool" },
      });
      emit({ type: "tool_result", tool: call.name, ok: false, summary: "Unknown tool" });
      return { ok: false, error: `Unknown tool: ${call.name}` };
    }

    let parsed: unknown;
    try {
      parsed = tool.schema.parse(JSON.parse(call.arguments || "{}"));
    } catch {
      // Always close the tool step — without this event the UI chip would
      // stay "running" forever even though nothing executed.
      emit({
        type: "tool_result",
        tool: call.name,
        ok: false,
        summary: "The agent supplied invalid arguments for this step",
      });
      return {
        ok: false,
        error: `Invalid arguments for ${call.name}. Provide a JSON object matching the tool schema.`,
      };
    }

    try {
      // Record entities from this tool call for follow-up resolution.
      await this.entityMemory.record(
        ctx.conversationId,
        extractEntitiesFromInput(call.name, parsed as Record<string, unknown>),
      );

      if (tool.confirmation === "required") {
        // Run propose-time validation so the user sees warnings (e.g.
        // "category doesn't exist — confirming will create it") on the
        // confirm card AND the LLM sees them in the result so its text
        // response matches the card.
        const warnings: { field: string; message: string }[] = tool.validate
          ? await tool.validate(parsed, { userId: ctx.userId }).catch(() => [])
          : [];

        // Run pre-propose input resolution so server-resolved values (e.g. the
        // user's default account when none was specified) are visible on the
        // confirmation card AND stored as part of the action input. The resolved
        // input replaces the original for both the proposal and the card.
        const resolvedInput = tool.resolveInput
          ? await tool.resolveInput(parsed, { userId: ctx.userId })
          : parsed;

        const proposal = await this.actionService.propose({
          userId: ctx.userId,
          conversationId: ctx.conversationId,
          tool: tool.name,
          input: resolvedInput,
          runId: ctx.runId,
        });
        emit({
          type: "confirmation_required",
          actionId: proposal.id,
          tool: tool.name,
          card: await this.actionService.buildConfirmationCard(
            tool.name,
            resolvedInput,
            ctx.userId,
            warnings,
          ),
        });
        await this.auditService.record({
          userId: ctx.userId,
          runId: ctx.runId,
          action: "tool.propose",
          tool: tool.name,
          status: "proposed",
          metadata: { actionId: proposal.id, warnings: warnings.length },
        });
        const warningBlock =
          warnings.length > 0
            ? ` Validation warnings: ${warnings.map((w) => `${w.field}: ${w.message}`).join("; ")}.`
            : "";
        return {
          ok: true,
          status: "awaiting_confirmation",
          actionId: proposal.id,
          message:
            "The action was proposed and is waiting for the user to confirm. Its result will arrive after confirmation." +
            warningBlock,
        };
      }

      const output = await tool.execute(parsed, ctx);
      // Record entities from the tool output (lists, created records, etc.).
      await this.entityMemory.record(
        ctx.conversationId,
        extractEntitiesFromOutput(call.name, tool.serialize(output)),
      );

      // Special handling for conversational action management tools:
      // - action.patch returns an updated confirmation card → emit action_updated
      //   so the client replaces the existing card in place (no duplicate).
      // - action.confirm returns an execution result → emit action_result.
      if (call.name === "action.patch" && (output as { card?: unknown }).card) {
        const patchOutput = output as {
          ok: boolean;
          actionId: string;
          tool: string;
          card: import("@finai/ai-engine").AgentCard;
          error?: string;
        };
        if (patchOutput.ok && patchOutput.card) {
          emit({
            type: "action_updated",
            actionId: patchOutput.actionId,
            tool: patchOutput.tool,
            card: patchOutput.card,
          });
          await this.auditService.record({
            userId: ctx.userId,
            runId: ctx.runId,
            action: "action.patch",
            tool: patchOutput.tool,
            status: "success",
          });
          return {
            ok: true,
            status: "action_updated",
            actionId: patchOutput.actionId,
            message: "The pending action has been updated. Show the updated confirmation card.",
          };
        }
        // Patch failed — surface the error as a tool_result
        emit({
          type: "tool_result",
          tool: call.name,
          ok: false,
          summary: patchOutput.error || "Failed to patch the pending action",
        });
        return { ok: false, error: patchOutput.error || "Failed to patch" };
      }

      if (call.name === "action.confirm" && (output as { actionId?: string }).actionId) {
        const confirmOutput = output as {
          ok: boolean;
          actionId: string;
          tool: string;
          alreadyExecuted?: boolean;
          result?: unknown;
          error?: string;
        };
        if (confirmOutput.ok) {
          emit({
            type: "action_result",
            actionId: confirmOutput.actionId,
            ok: true,
          });
          await this.auditService.record({
            userId: ctx.userId,
            runId: ctx.runId,
            action: "action.confirm",
            tool: confirmOutput.tool,
            status: "success",
          });
          return {
            ok: true,
            status: "action_executed",
            actionId: confirmOutput.actionId,
            message: "The action has been confirmed and executed.",
          };
        }
        emit({
          type: "action_result",
          actionId: confirmOutput.actionId,
          ok: false,
        });
        return { ok: false, error: confirmOutput.error || "Failed to confirm" };
      }

      emit({
        type: "tool_result",
        tool: call.name,
        ok: true,
        summary: tool.summarize(output),
      });
      await this.auditService.record({
        userId: ctx.userId,
        runId: ctx.runId,
        action: "tool.execute",
        tool: tool.name,
        status: "success",
      });
      return { ok: true, data: tool.serialize(output) };
    } catch (error) {
      const message = (error as Error).message || "Tool execution failed";
      emit({ type: "tool_result", tool: call.name, ok: false, summary: message });
      await this.auditService.record({
        userId: ctx.userId,
        runId: ctx.runId,
        action: "tool.execute",
        tool: tool.name,
        status: "error",
        metadata: { error: message },
      });
      return { ok: false, error: message };
    }
  }
}

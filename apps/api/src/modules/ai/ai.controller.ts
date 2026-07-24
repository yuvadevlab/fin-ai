import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { OllamaService } from "./ollama.service";
import { ContextBuilderService } from "./context-builder.service";
import { ConversationService } from "./conversation.service";
import { buildSystemPrompt } from "./prompt-builder";
import { PAGE_INSIGHT_PROMPTS, SUGGEST_EMOJI_PROMPT } from "./prompts.config";

@ApiTags("AI")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ai")
export class AiController {
  constructor(
    private readonly ollamaService: OllamaService,
    private readonly contextBuilder: ContextBuilderService,
    private readonly conversationService: ConversationService,
  ) {}

  @Get("conversations")
  @ApiOperation({ summary: "List all AI conversations for the current user" })
  getConversations(
    @CurrentUser("id") userId: string,
    @Query("workspaceId") workspaceId?: string,
  ): Promise<Record<string, unknown>[]> {
    return this.conversationService.getConversations(userId, workspaceId ?? "");
  }

  @Get("suggest-emoji")
  @ApiOperation({ summary: "Suggest a relevant emoji for a category name" })
  async suggestEmoji(@Query("category") category: string): Promise<{ emoji: string }> {
    if (!category) {
      throw new Error("Category name is required");
    }
    const prompt = `Category name: ${category}\nSuggested emoji:`;

    const response = await this.ollamaService.chat({
      systemPrompt: SUGGEST_EMOJI_PROMPT,
      prompt,
    });

    return { emoji: response.trim() || "📁" };
  }

  @Get("conversations/:id")
  @ApiOperation({ summary: "Get a conversation with its messages" })
  getConversation(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.conversationService.getConversation(id, userId);
  }

  @Post("chat")
  @ApiOperation({ summary: "Stream an AI response via SSE" })
  async chat(
    @Body()
    body: { question: string; workspaceId: string; conversationId?: string },
    @CurrentUser("id") userId: string,
    @Res() res: Response,
  ) {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Build financial context from DB
    const context = await this.contextBuilder.buildFinanceContext(body.workspaceId);
    const systemPrompt = buildSystemPrompt(context);

    // Persist user message & resolve/create conversation
    let conversationId = body.conversationId;
    if (!conversationId) {
      const convo = await this.conversationService.createConversation(
        userId,
        body.workspaceId,
        body.question.slice(0, 80),
      );
      conversationId = convo.id;
    } else {
      // Ensure existing conversation belongs to this user
      const existing = await this.conversationService.getConversation(conversationId, userId);
      if (!existing) {
        res.write(`data: ${JSON.stringify({ error: "Conversation not found" })}\n\n`);
        res.end();
        return;
      }
    }

    await this.conversationService.addMessage(conversationId, "user", body.question);

    // Emit conversationId first so the client can track the session
    res.write(`data: ${JSON.stringify({ conversationId })}\n\n`);

    // Stream from Ollama and accumulate for persistence
    let fullResponse = "";

    await this.ollamaService.streamChatWithCallback(
      { prompt: body.question, systemPrompt },
      res,
      (token) => {
        fullResponse += token;
      },
    );

    // Persist the full assistant response
    if (fullResponse && conversationId) {
      await this.conversationService.addMessage(conversationId, "assistant", fullResponse);
    }
  }

  @Get("insight")
  @ApiOperation({
    summary: "Stream a short AI insight for a given page context via SSE",
  })
  async insight(
    @Query("workspaceId") workspaceId: string,
    @Query("page") page: string = "dashboard",
    @Res() res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    if (!workspaceId) {
      res.write(`data: ${JSON.stringify({ error: "workspaceId is required" })}\n\n`);
      res.end();
      return;
    }

    const context = await this.contextBuilder.buildFinanceContext(workspaceId);

    const prompt =
      PAGE_INSIGHT_PROMPTS[page as keyof typeof PAGE_INSIGHT_PROMPTS] ??
      PAGE_INSIGHT_PROMPTS.dashboard;
    const systemPrompt = `You are FinAI, my personal financial advisor. Respond directly to me in a helpful, friendly, one-on-one personal tone (always use "you" and "your" instead of "the user" or "their"). Respond ONLY with the requested short financial insight — no greetings, no markdown formatting, just plain prose.\n\nHere is my financial context:\n${context}`;

    await this.ollamaService.streamChatWithCallback({ prompt, systemPrompt }, res);
  }
}

import { Body, Controller, Delete, Get, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { type Response } from "express";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { OllamaService } from "@/modules/ai/ollama.service";
import { ContextBuilderService } from "@/modules/ai/context-builder.service";
import { ConversationService } from "@/modules/ai/conversation.service";
import {
  buildAdvisorSystemPrompt,
  buildInsightSystemPrompt,
  buildPageInsightUserPrompt,
  buildEmojiSuggestionUserPrompt,
  EMOJI_SUGGESTION_SYSTEM_PROMPT,
} from "@finai/ai-engine";

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
  getConversations(@CurrentUser("id") userId: string): Promise<Record<string, unknown>[]> {
    return this.conversationService.getConversations(userId);
  }

  @Get("suggest-emoji")
  @ApiOperation({ summary: "Suggest a relevant emoji for a category name" })
  async suggestEmoji(@Query("category") category: string): Promise<{ emoji: string }> {
    if (!category) {
      throw new Error("Category name is required");
    }
    const prompt = buildEmojiSuggestionUserPrompt(category);

    const response = await this.ollamaService.chat({
      systemPrompt: EMOJI_SUGGESTION_SYSTEM_PROMPT,
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

  @Delete("conversations/:id")
  @ApiOperation({ summary: "Delete an AI conversation" })
  async deleteConversation(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ): Promise<{ success: boolean }> {
    const success = await this.conversationService.deleteConversation(id, userId);
    return { success };
  }

  @Post("chat")
  @ApiOperation({ summary: "Stream an AI response via SSE" })
  async chat(
    @Body()
    body: { question: string; conversationId?: string },
    @CurrentUser("id") userId: string,
    @Res() res: Response,
  ) {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Build financial context from DB for user
    const context = await this.contextBuilder.buildFinanceContext(userId);
    const systemPrompt = buildAdvisorSystemPrompt(context);

    // Persist user message & resolve/create conversation
    let conversationId = body.conversationId;
    if (!conversationId) {
      const convo = await this.conversationService.createConversation(
        userId,
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

    // Fetch recent message history if conversationId exists (up to 20 turns)
    let historyMessages: { role: string; content: string }[] = [];
    if (conversationId) {
      const recent = await this.conversationService.getRecentMessages(conversationId, 20);
      historyMessages = recent.reverse().map((m) => ({
        role: m.role === "ASSISTANT" ? "assistant" : "user",
        content: m.content,
      }));
    }

    await this.conversationService.addMessage(conversationId, "user", body.question);

    // Emit conversationId first so the client can track the session
    res.write(`data: ${JSON.stringify({ conversationId })}\n\n`);

    // Stream from Ollama and accumulate for persistence
    let fullResponse = "";

    await this.ollamaService.streamChatWithCallback(
      { prompt: body.question, systemPrompt, historyMessages },
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
    @CurrentUser("id") userId: string,
    @Query("page") page: string = "dashboard",
    @Res() res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const context = await this.contextBuilder.buildFinanceContext(userId);

    const prompt = buildPageInsightUserPrompt(page);
    const systemPrompt = buildInsightSystemPrompt(context);

    await this.ollamaService.streamChatWithCallback({ prompt, systemPrompt }, res);
  }
}

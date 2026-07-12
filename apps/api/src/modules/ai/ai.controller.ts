import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { OllamaService } from "./ollama.service";
import { ContextBuilderService } from "./context-builder.service";
import { ConversationService } from "./conversation.service";
import { buildSystemPrompt } from "./prompt-builder";

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
    @Param("workspaceId") workspaceId: string,
  ): Promise<any[]> {
    return this.conversationService.getConversations(userId, workspaceId ?? "");
  }

  @Get("conversations/:id")
  @ApiOperation({ summary: "Get a conversation with its messages" })
  getConversation(@Param("id") id: string, @CurrentUser("id") userId: string): Promise<any> {
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

    // Persist user message
    let conversationId = body.conversationId;
    if (!conversationId) {
      const convo = await this.conversationService.createConversation(
        userId,
        body.workspaceId,
        body.question.slice(0, 80),
      );
      conversationId = convo.id;
    }
    await this.conversationService.addMessage(conversationId, "user", body.question);

    // Stream from Ollama — response is collected for persistence
    let fullResponse = "";
    const originalWrite = res.write.bind(res);
    (res as any).write = (chunk: any, ...args: any[]) => {
      try {
        const str = typeof chunk === "string" ? chunk : chunk.toString();
        const match = str.match(/"token":"([^"]*)"/);
        if (match) fullResponse += match[1];
      } catch {}
      return originalWrite(chunk, ...args);
    };

    await this.ollamaService.streamChat(
      { model: "gemma3", prompt: body.question, systemPrompt },
      res,
    );

    // Persist assistant message after stream completes
    if (fullResponse && conversationId) {
      await this.conversationService.addMessage(conversationId, "assistant", fullResponse);
    }
  }
}

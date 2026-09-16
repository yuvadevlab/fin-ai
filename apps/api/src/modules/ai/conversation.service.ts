import { Injectable } from "@nestjs/common";
import { Logger } from "@finai/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { MessageRole, Conversation, Message } from "@finai/database";

/**
 * Manages AI conversation persistence: creating conversations, adding
 * messages (user/assistant), and fetching recent history for context.
 *
 * Messages are stored via Prisma `MessageRole` enum (USER/ASSISTANT).
 * The `addMessage` call also bumps the conversation's `updatedAt` timestamp
 * so conversations sort by recency correctly in the sidebar.
 */
@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string): Promise<(Conversation & { messages: Message[] })[]> {
    this.logger.debug(`[getConversations] Listing conversations for user ${userId.slice(0, 8)}`);
    return this.prisma.client.conversation.findMany({
      where: { userId },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getConversation(
    id: string,
    userId: string,
  ): Promise<(Conversation & { messages: Message[] }) | null> {
    this.logger.debug(
      `[getConversation] Fetching conversation ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.prisma.client.conversation.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  async createConversation(userId: string, title: string): Promise<Conversation> {
    const convo = await this.prisma.client.conversation.create({
      data: { userId, title },
    });
    this.logger.debug(
      `Created conversation ${convo.id.slice(0, 8)} for user ${userId.slice(0, 8)}: "${title}"`,
    );
    return convo;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    this.logger.info(
      `[deleteConversation] Deleting conversation ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const res = await this.prisma.client.conversation.deleteMany({
      where: { id, userId },
    });
    if (res.count > 0) {
      this.logger.log(`Deleted conversation ${id.slice(0, 8)} (userId: ${userId.slice(0, 8)})`);
    } else {
      this.logger.warn(
        `[deleteConversation] Conversation ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
    }
    return res.count > 0;
  }

  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
  ): Promise<Message> {
    const roleMap: Record<string, MessageRole> = {
      user: MessageRole.USER,
      assistant: MessageRole.ASSISTANT,
    };

    // Touch conversation updatedAt timestamp
    await this.prisma.client.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const message = await this.prisma.client.message.create({
      data: {
        conversationId,
        role: roleMap[role] ?? MessageRole.USER,
        content,
      },
    });
    this.logger.debug(
      `Added ${role} message ${message.id.slice(0, 8)} to conversation ${conversationId.slice(0, 8)} (${content.length} chars)`,
    );
    return message;
  }

  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    this.logger.debug(
      `[getRecentMessages] Fetching last ${limit} message(s) for conversation ${conversationId.slice(0, 8)}`,
    );
    return this.prisma.client.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

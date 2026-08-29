import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MessageRole, Conversation, Message } from "@finai/database";

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string): Promise<(Conversation & { messages: Message[] })[]> {
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
    return this.prisma.client.conversation.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  async createConversation(userId: string, title: string): Promise<Conversation> {
    return this.prisma.client.conversation.create({
      data: { userId, title },
    });
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    const res = await this.prisma.client.conversation.deleteMany({
      where: { id, userId },
    });
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

    return this.prisma.client.message.create({
      data: {
        conversationId,
        role: roleMap[role] ?? MessageRole.USER,
        content,
      },
    });
  }

  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    return this.prisma.client.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

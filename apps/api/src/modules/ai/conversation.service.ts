import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MessageRole, Conversation, Message } from "@finai/database";

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async getConversations(
    userId: string,
    workspaceId: string,
  ): Promise<(Conversation & { messages: Message[] })[]> {
    return this.prisma.client.conversation.findMany({
      where: { userId, workspaceId },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
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

  async createConversation(
    userId: string,
    workspaceId: string,
    title: string,
  ): Promise<Conversation> {
    return this.prisma.client.conversation.create({
      data: { userId, workspaceId, title },
    });
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
    return this.prisma.client.message.create({
      data: {
        conversationId,
        role: roleMap[role] ?? MessageRole.USER,
        content,
      },
    });
  }
}

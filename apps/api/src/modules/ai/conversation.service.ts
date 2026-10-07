/**
 * @file apps/api/src/modules/ai/conversation.service.ts
 * @description AI conversation and message history persistence service.
 * Manages conversational threads, message logs, and summary titles in PostgreSQL.
 * @module @finai/api/modules/ai/conversation.service
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { MessageRole, Conversation, Message } from "@finai/database";

/**
 * Service managing AI conversation persistence, thread summaries, and chat history.
 *
 * Messages are stored via Prisma `MessageRole` enum (USER/ASSISTANT).
 * The `addMessage` call also updates the conversation's `updatedAt` timestamp
 * so conversations sort chronologically by recency in the navigation drawer.
 */
@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all conversations belonging to a user, ordered by most recently updated.
   *
   * @param userId - Unique identifier of the authenticated user.
   * @returns List of conversations with their initial message for list previews.
   */
  async getConversations(userId: string): Promise<(Conversation & { messages: Message[] })[]> {
    this.logger.info(`[getConversations] Listing conversations for user ${userId.slice(0, 8)}`);

    // Fetch conversation summaries with only the first message to minimize payload size
    return this.prisma.client.conversation.findMany({
      where: { userId },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Retrieves an individual conversation thread with its full chronological message history.
   *
   * @param id - The UUID of the conversation.
   * @param userId - The UUID of the owning user for multi-tenant isolation.
   * @returns The conversation with all messages, or null if not found.
   */
  async getConversation(
    id: string,
    userId: string,
  ): Promise<(Conversation & { messages: Message[] }) | null> {
    this.logger.info(
      `[getConversation] Fetching convo ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );

    // Retrieve conversation scoped strictly to the authenticated user
    return this.prisma.client.conversation.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  /**
   * Creates a new conversation thread with an initial title.
   *
   * @param userId - The UUID of the owning user.
   * @param title - The initial topic or question preview title.
   * @returns Newly created conversation record.
   */
  async createConversation(userId: string, title: string): Promise<Conversation> {
    this.logger.info(
      `[createConversation] Creating convo for user ${userId.slice(0, 8)}: "${title.slice(0, 30)}"`,
    );

    const convo = await this.prisma.client.conversation.create({
      data: { userId, title },
    });

    this.logger.info(
      `[createConversation] Created convo ${convo.id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return convo;
  }

  /**
   * Updates the summary title of an existing conversation thread.
   *
   * @param id - The conversation UUID.
   * @param title - The AI-generated or user-edited summary title.
   * @returns The updated conversation record.
   */
  async updateTitle(id: string, title: string): Promise<Conversation> {
    this.logger.info(`[updateTitle] Updating title for convo ${id.slice(0, 8)} to "${title}"`);

    return this.prisma.client.conversation.update({
      where: { id },
      data: { title },
    });
  }

  /**
   * Deletes an AI conversation thread and all cascaded messages.
   *
   * @param id - The conversation UUID to delete.
   * @param userId - The authenticated user UUID for tenancy verification.
   * @returns True if a record was deleted, false otherwise.
   */
  async deleteConversation(id: string, userId: string): Promise<boolean> {
    this.logger.info(
      `[deleteConversation] Deleting convo ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );

    // Scoped delete to prevent cross-tenant deletion attempts
    const res = await this.prisma.client.conversation.deleteMany({
      where: { id, userId },
    });

    if (res.count > 0) {
      this.logger.info(
        `[deleteConversation] Deleted convo ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
      );
    } else {
      this.logger.warn(
        `[deleteConversation] Convo ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
    }
    return res.count > 0;
  }

  /**
   * Persists a message turn within a conversation thread and updates conversation recency.
   *
   * @param conversationId - The target conversation UUID.
   * @param role - Whether the speaker is 'user' or 'assistant'.
   * @param content - The text payload of the message.
   * @returns The newly created database message record.
   */
  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
  ): Promise<Message> {
    const roleMap: Record<string, MessageRole> = {
      user: MessageRole.USER,
      assistant: MessageRole.ASSISTANT,
    };

    // Bump the conversation updatedAt timestamp so it floats to the top of history
    await this.prisma.client.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Create the message row with mapped database enum role
    const message = await this.prisma.client.message.create({
      data: {
        conversationId,
        role: roleMap[role] ?? MessageRole.USER,
        content,
      },
    });

    this.logger.info(
      `[addMessage] Added ${role} message ${message.id.slice(0, 8)} to convo ${conversationId.slice(0, 8)} (${content.length} chars)`,
    );
    return message;
  }

  /**
   * Fetches the most recent messages in a conversation for context assembly.
   *
   * @param conversationId - The conversation UUID.
   * @param limit - Number of recent messages to fetch (default: 10).
   * @returns Array of messages ordered from newest to oldest.
   */
  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    this.logger.info(
      `[getRecentMessages] Fetching last ${limit} message(s) for convo ${conversationId.slice(0, 8)}`,
    );

    return this.prisma.client.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

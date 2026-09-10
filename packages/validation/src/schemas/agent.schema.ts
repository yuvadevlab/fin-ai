import { z } from "zod";

/**
 * API contract schema for the agent chat endpoint (`POST /ai/chat` today,
 * `POST /agent/chat` once the agent module lands).
 */
export const agentChatSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(2000, "Question cannot exceed 2000 characters"),
  conversationId: z.string().uuid("Invalid conversation ID").optional(),
});

export type AgentChatInput = z.infer<typeof agentChatSchema>;

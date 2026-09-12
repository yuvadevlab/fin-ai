import { z } from "zod";

/**
 * API contract schema for the agent chat endpoint (`POST /ai/chat` today,
 * `POST /agent/chat` once the agent module lands).
 *
 * Routing between the tool-enabled agent loop and the tool-free conversational
 * fast-path is decided automatically by the server (fail-open intent router);
 * clients cannot force a mode.
 */
export const agentChatSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(2000, "Question cannot exceed 2000 characters"),
  conversationId: z.string().uuid("Invalid conversation ID").optional(),
});

export type AgentChatInput = z.infer<typeof agentChatSchema>;

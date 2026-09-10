/** Who produced a chat message; mirrors the wire roles used by the AI endpoints. */
export type MessageRole = "user" | "assistant" | "system";

/** One turn of advisor chat as exchanged over the AI (non-agent) REST API. */
export interface ChatMessagePayload {
  role: MessageRole;
  text: string;
  /** True while this assistant message is still being streamed token-by-token. */
  streaming?: boolean;
}

/**
 * Server-Sent Event frame for token streaming on the advisor chat endpoint.
 * All fields are optional because the same payload shape carries terminal
 * states: `done` ends the stream, `error` replaces the body on failure.
 */
export interface StreamTokenPayload {
  token?: string;
  done?: boolean;
  /** Echoed once (first frame) so the client can track the conversation. */
  conversationId?: string;
  error?: string;
}

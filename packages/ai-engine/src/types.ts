export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessagePayload {
  role: MessageRole;
  text: string;
  streaming?: boolean;
}

export interface StreamTokenPayload {
  token?: string;
  done?: boolean;
  conversationId?: string;
  error?: string;
}

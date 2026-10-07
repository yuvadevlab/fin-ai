"use client";

/**
 * @file apps/web/src/features/ai-advisor/context/AgentChatProvider.tsx
 * @description State provider preserving chat streams and messages across route transitions.
 * @module @finai/web/features/ai-advisor/context/AgentChatProvider
 */

import type { ReactNode } from "react";
import { useAgentChat, type UseAgentChatOptions } from "../api/useAgentChat";
import { AgentChatContext } from "./agent-chat-context";

/** Props configuration for the {@link AgentChatProvider} wrapper component */
export interface AgentChatProviderProps {
  /** Child component subtree to receive chat context */
  children: ReactNode;
  /** Optional options to configure the underlying {@link useAgentChat} hook */
  options?: UseAgentChatOptions;
}

/**
 * Context provider mounted in the `/ai-advisor` layout.
 * Ensures active SSE streams, messages, and approvals persist seamlessly across URL transitions.
 */
export function AgentChatProvider({ children, options }: AgentChatProviderProps) {
  const chat = useAgentChat(options);
  return <AgentChatContext.Provider value={chat}>{children}</AgentChatContext.Provider>;
}

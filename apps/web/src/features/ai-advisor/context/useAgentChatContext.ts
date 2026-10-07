"use client";

/**
 * @file apps/web/src/features/ai-advisor/context/useAgentChatContext.ts
 * @description Consumer hook accessing the active AgentChatContext instance.
 * @module @finai/web/features/ai-advisor/context/useAgentChatContext
 */

import { useContext } from "react";
import { AgentChatContext, type AgentChatReturn } from "./agent-chat-context";

/**
 * Accesses the conversational agent chat context.
 *
 * @throws {Error} If called outside of an active {@link AgentChatProvider}.
 * @returns The active {@link AgentChatReturn} state and dispatch interface.
 */
export function useAgentChatContext(): AgentChatReturn {
  const ctx = useContext(AgentChatContext);
  if (!ctx) {
    throw new Error("useAgentChatContext must be used within an AgentChatProvider");
  }
  return ctx;
}

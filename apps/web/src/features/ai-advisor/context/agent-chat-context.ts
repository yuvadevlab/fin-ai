"use client";

/**
 * @file apps/web/src/features/ai-advisor/context/agent-chat-context.ts
 * @description React Context definition for sharing conversational agent state across components.
 * @module @finai/web/features/ai-advisor/context/agent-chat-context
 */

import { createContext } from "react";
import type { useAgentChat } from "../api/useAgentChat";

/** Return interface of the {@link useAgentChat} hook shared through React Context */
export type AgentChatReturn = ReturnType<typeof useAgentChat>;

/**
 * Context object holding live agent chat state, action runners, and stream controllers.
 */
export const AgentChatContext = createContext<AgentChatReturn | null>(null);

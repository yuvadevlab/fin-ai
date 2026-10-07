/**
 * @file apps/web/src/features/ai-advisor/api/chatStorage.ts
 * @description In-memory and sessionStorage persistence adapter for conversational threads.
 * Provides 0ms instant thread switching without UI jitter or skeleton flashing,
 * mirroring the architecture pattern established in OrchestrAI Cowork Studio.
 * @module @finai/web/features/ai-advisor/api/chatStorage
 */

import { StorageKey } from "@finai/shared-types";
import type { AgentChatMessage } from "./agentTypes";

/** Prefix key used to isolate cached conversation threads within browser sessionStorage */
const CHAT_CACHE_PREFIX = StorageKey.CHAT_CACHE_PREFIX;

/**
 * Loads cached conversation messages from browser sessionStorage.
 *
 * @param conversationId - The unique UUID identifier of the conversation.
 * @returns An array of hydrated {@link AgentChatMessage} items if cached, or `null` if missed.
 */
export function loadCachedMessages(conversationId: string): AgentChatMessage[] | null {
  if (typeof window === "undefined" || !conversationId) return null;
  try {
    const raw = sessionStorage.getItem(`${CHAT_CACHE_PREFIX}${conversationId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as AgentChatMessage[]) : null;
  } catch {
    return null;
  }
}

/**
 * Persists conversation messages to browser sessionStorage for instant zero-latency retrieval.
 *
 * @param conversationId - The unique UUID identifier of the conversation.
 * @param messages - The complete array of {@link AgentChatMessage} items to serialize.
 */
export function saveCachedMessages(conversationId: string, messages: AgentChatMessage[]): void {
  if (typeof window === "undefined" || !conversationId || messages.length === 0) return;
  try {
    sessionStorage.setItem(`${CHAT_CACHE_PREFIX}${conversationId}`, JSON.stringify(messages));
  } catch {
    // Graceful storage quota fallback when session storage is constrained
  }
}

/**
 * Removes cached conversation messages from sessionStorage when a conversation is deleted.
 *
 * @param conversationId - The unique UUID identifier of the conversation to invalidate.
 */
export function removeCachedMessages(conversationId: string): void {
  if (typeof window === "undefined" || !conversationId) return;
  try {
    sessionStorage.removeItem(`${CHAT_CACHE_PREFIX}${conversationId}`);
  } catch {
    // Graceful fallback for non-standard browser storage environments
  }
}

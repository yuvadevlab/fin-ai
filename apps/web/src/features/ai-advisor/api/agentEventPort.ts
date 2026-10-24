/**
 * @file apps/web/src/features/ai-advisor/api/agentEventPort.ts
 * @description Event port contracts, logging utilities, and step keys for the SSE event loop.
 * @module @finai/web/features/ai-advisor/api/agentEventPort
 */

import type { AgentCard } from "@finai/ai-engine";
import type { AgentConfirmationStatus, AgentRunLogLevel } from "@finai/shared-types";
import type {
  AgentActivity,
  AgentConfirmation,
  AgentResolvedMode,
  AgentRunLogEntry,
} from "./agentTypes";

let runStartTime = Date.now();

export function resetRunStartTime(): void {
  runStartTime = Date.now();
}

export function makeLog(
  level: AgentRunLogLevel,
  message: string,
  detail?: string,
): AgentRunLogEntry {
  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now,
    elapsedMs: Math.max(0, now - runStartTime),
    level,
    message,
    detail,
  };
}

export function phaseKey(phase: string, turn?: number, pendingAction?: boolean): string {
  return `phase:${phase}:${turn ?? 0}${pendingAction ? ":pending" : ""}`;
}

export function approvalKey(actionId: string): string {
  return `approval:${actionId}`;
}

export interface AgentEventPort {
  appendLog?(log: AgentRunLogEntry): void;
  appendText(content: string): void;
  replaceText(content: string): void;
  appendActivity(activity: AgentActivity): void;
  updateActivity(toolKey: string, patch: Partial<AgentActivity>): void;
  resolveApprovalActivity(actionId: string, patch: Partial<AgentActivity>): void;
  appendConfirmation(confirmation: AgentConfirmation): void;
  updateConfirmationStatus(actionId: string, status: AgentConfirmationStatus): void;
  updateConfirmationCard(actionId: string, card: AgentCard, tool?: string): void;
  failStream(error: string): void;
  endStream(): void;
  onConversation(conversationId: string): void;
  /** Emitted on first turn when a smart summary title is generated. */
  onTitle?(title: string): void;
  /** Set once per run after routing resolves — which runtime answered. */
  onMode?(mode: AgentResolvedMode): void;
}

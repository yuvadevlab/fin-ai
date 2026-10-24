/**
 * @file packages/shared-types/src/agent-runtime.enums.ts
 * @description Canonical runtime, event, stream, activity, and log enums for the AI Agent.
 * @module @finai/shared-types/agent-runtime-enums
 */

/** Provider-agnostic chat roles for LLMs */
export const LlmRole = {
  SYSTEM: "system",
  USER: "user",
  ASSISTANT: "assistant",
  TOOL: "tool",
} as const;

export type LlmRole = (typeof LlmRole)[keyof typeof LlmRole];

/** Low-level streaming event types emitted by LLM adapters */
export const LlmStreamEventType = {
  TEXT_DELTA: "text-delta",
  TOOL_CALL: "tool_call",
  USAGE: "usage",
  DONE: "done",
} as const;

export type LlmStreamEventType = (typeof LlmStreamEventType)[keyof typeof LlmStreamEventType];

/** Lifecycle status of an individual tool call or execution step */
export const AgentActivityStatus = {
  PENDING: "pending",
  RUNNING: "running",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type AgentActivityStatus = (typeof AgentActivityStatus)[keyof typeof AgentActivityStatus];

/** Kind of activity entry in the timeline */
export const AgentActivityKind = {
  TOOL: "tool",
  PHASE: "phase",
  APPROVAL: "approval",
} as const;

export type AgentActivityKind = (typeof AgentActivityKind)[keyof typeof AgentActivityKind];

/** Confirmation card lifecycle status */
export const AgentConfirmationStatus = {
  PENDING: "pending",
  EXECUTED: "executed",
  REJECTED: "rejected",
  FAILED: "failed",
} as const;

export type AgentConfirmationStatus =
  (typeof AgentConfirmationStatus)[keyof typeof AgentConfirmationStatus];

/** Real-time processing log entry levels */
export const AgentRunLogLevel = {
  SYS: "SYS",
  CTX: "CTX",
  LLM: "LLM",
  TOOL: "TOOL",
  STREAM: "STREAM",
  ACTION: "ACTION",
  DONE: "DONE",
  ERR: "ERR",
} as const;

export type AgentRunLogLevel = (typeof AgentRunLogLevel)[keyof typeof AgentRunLogLevel];

/** Role in agent conversation chat messages */
export const AgentChatRole = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;

export type AgentChatRole = (typeof AgentChatRole)[keyof typeof AgentChatRole];

/**
 * Provider-agnostic LLM chat contracts for the FinAI agent runtime.
 *
 * The abstraction exists so the agent runtime is not coupled to individual
 * provider implementations.  Concrete providers: Ollama, OpenRouter, Groq,
 * and Google AI Studio.
 */

import { LlmRole, LlmStreamEventType } from "@fin-ai/shared-types";

export { LlmRole, LlmStreamEventType };

/** One entry in the tool manifest advertised to the model (function calling). */
export interface LlmToolDefinition {
  /** Tool name, e.g. "accounts.list". */
  name: string;
  /** One-line description of what the tool does and when to use it. */
  description: string;
  /** JSON Schema object describing the tool input. */
  parameters: Record<string, unknown>;
}

/** A single chat message in the provider-agnostic conversation format. */
export interface LlmMessage {
  role: LlmRole;
  content: string;
  /** Tool name for role === "tool" messages. */
  toolName?: string;
}

/** A tool invocation the model requested (arguments still JSON-encoded). */
export interface LlmToolCall {
  /** Opaque call identifier (generated when the provider does not supply one). */
  id: string;
  name: string;
  /** JSON-encoded arguments string. */
  arguments: string;
}

/**
 * Incremental output of a streaming LLM call, in arrival order. A typical
 * agentic turn emits tool_call (no text) or text-delta* (pure answer);
 * usage and done terminate the stream.
 */
export type LlmStreamEvent =
  | { type: typeof LlmStreamEventType.TEXT_DELTA; text: string }
  | { type: typeof LlmStreamEventType.TOOL_CALL; toolCall: LlmToolCall }
  | { type: typeof LlmStreamEventType.USAGE; tokensIn: number; tokensOut: number }
  | { type: typeof LlmStreamEventType.DONE };

/** A full (non-streaming) chat request. */
export interface LlmChatRequest {
  messages: LlmMessage[];
  /** Tool manifest; omit for plain text-only completion. */
  tools?: LlmToolDefinition[];
}

/** Result of a non-streaming completion: answer text and/or requested tool calls. */
export interface LlmCompleteResult {
  content: string;
  toolCalls: LlmToolCall[];
  tokensIn?: number;
  tokensOut?: number;
}

/** Connection parameters for a chat model endpoint. */
export interface ChatModelConfig {
  baseUrl: string;
  /** API path appended to the base URL, e.g. "/v1/chat/completions". */
  apiPath: string;
  model: string;
  /** API key for cloud providers (OpenRouter, Groq, Google AI Studio). */
  apiKey?: string;
}

/**
 * Wire-format shape of an OpenAI-compatible `tool_calls` entry, shared by the
 * OpenRouter, Groq, and Google AI Studio (OpenAI-compat) response payloads.
 */
export interface OpenAiStyleToolCall {
  id?: string;
  function?: {
    name?: string;
    arguments?: string | Record<string, unknown>;
  };
}

/**
 * Provider-agnostic chat model interface consumed by the agent runtime.
 * Implementations wrap a specific backend (Ollama, OpenRouter, Groq, or
 * Google AI Studio); the runtime stays identical regardless of the provider.
 * Consumer: {@link ChatModelConfig} passed at construction time.
 */
export interface ChatModel {
  readonly provider: string;
  readonly model: string;
  /** Streaming completion — yields text deltas / tool calls as they arrive. */
  stream(request: LlmChatRequest): AsyncIterable<LlmStreamEvent>;
  /** Blocking completion — resolves with the full result. */
  complete(request: LlmChatRequest): Promise<LlmCompleteResult>;
}

/** Thrown when the LLM backend cannot be reached (e.g. Ollama not running). */
export class LlmConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmConnectionError";
  }
}

/**
 * Canonical HTTP status codes and socket error markers that signify transient LLM failures.
 * Adheres to Rule 7: Enums over raw string unions.
 */
export enum TransientLlmErrorCode {
  SERVICE_UNAVAILABLE = "503",
  BAD_GATEWAY = "502",
  GATEWAY_TIMEOUT = "504",
  TOO_MANY_REQUESTS = "429",
  TIMEOUT = "timeout",
  CONN_RESET = "ECONNRESET",
}

/** Array of all canonical transient error markers for introspection. */
export const TRANSIENT_LLM_ERROR_CODES: readonly TransientLlmErrorCode[] =
  Object.values(TransientLlmErrorCode);

/** Operational retry configuration for LLM provider adapters. */
export const LLM_RETRY_CONFIG = {
  MAX_RETRIES: 2,
  BACKOFF_BASE_MS: 800,
  TIMEOUT_MS: 30_000,
  TEMPERATURE: 0.7,
} as const;

/**
 * Evaluates whether an error object signals a transient failure suitable for exponential retry.
 *
 * @param err - Unknown error object caught during model inference
 * @returns True if error is an Error instance containing any transient error code
 */
export function isTransientLlmError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return TRANSIENT_LLM_ERROR_CODES.some((code) => message.includes(code.toLowerCase()));
}

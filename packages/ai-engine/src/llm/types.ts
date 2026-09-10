/**
 * Provider-agnostic LLM chat contracts for the FinAI agent runtime.
 *
 * NOTE: this migration is Ollama-only by explicit product constraint —
 * no other providers are implemented. The abstraction exists so the agent
 * runtime is not coupled to individual tool implementations.
 */

/** Chat roles understood by the LLM layer. "tool" carries a tool result back to the model. */
export type LlmRole = "system" | "user" | "assistant" | "tool";

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
  | { type: "text-delta"; text: string }
  | { type: "tool_call"; toolCall: LlmToolCall }
  | { type: "usage"; tokensIn: number; tokensOut: number }
  | { type: "done" };

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
  model: string;
}

/**
 * Provider-agnostic chat model interface consumed by the agent runtime.
 * Implementations wrap a specific backend (currently Ollama only); the
 * runtime stays identical regardless of the provider behind this interface.
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

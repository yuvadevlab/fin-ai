import type { AgentCard, AgentStreamEvent } from "@finai/ai-engine";
import type { ValidationWarning } from "./tool-factory";

/** Authorization + tracing context injected into every tool execution. */
export interface AgentContext {
  /** Authenticated user — every service query is scoped to this id. */
  userId: string;
  /** Conversation the current run belongs to (entity memory + audit trail). */
  conversationId: string;
  /** Unique id for this agent run (correlates SSE events and audit rows). */
  runId: string;
}

/**
 * Read tools only query data; write tools can create/update/delete. The
 * distinction drives audit labels and UI affordances (activity chips).
 */
export type ToolAccess = "read" | "write";

/**
 * Write tools always use "required": the model can only PROPOSE such an
 * action; the row executes solely after the user confirms the card.
 */
export type ConfirmationPolicy = "none" | "required";

/** Sink for SSE stream events; implemented by the controller over `res.write`. */
export type AgentEventEmitter = (event: AgentStreamEvent) => void;

/**
 * A registered agent tool. Executors are thin adapters around existing
 * domain services — the LLM never touches Prisma directly.
 */
export interface AgentTool {
  name: string;
  description: string;
  access: ToolAccess;
  confirmation: ConfirmationPolicy;
  /** Human-readable activity label (e.g. "Recording transactions") */
  label?: string;
  /** React Query cache keys to bust after confirmation */
  invalidates?: string[];
  /** Zod schema validating the LLM-supplied input. */
  schema: import("zod").ZodTypeAny;
  execute(input: unknown, ctx: AgentContext): Promise<unknown>;
  /** Convert tool output to the JSON shape fed back to the LLM. */
  serialize(output: unknown): unknown;
  /**
   * Human-readable confirmation card for write tools. When absent, the
   * action service falls back to generic key/value rows built from the
   * validated input.
   */
  describe?(input: unknown): AgentCard;
  /**
   * Pre-confirmation validation. Runs at propose time so the user sees
   * warnings (e.g. "category doesn't exist yet") on the confirm card
   * instead of a hard failure after confirm.
   */
  validate?(input: unknown, ctx: { userId: string }): Promise<ValidationWarning[]>;
  /**
   * Pre-propose input resolution. Runs after schema parse + validation but
   * BEFORE the action is proposed and the confirmation card is built. Use this
   * to inject server-resolved values (e.g. the user's default account when
   * none was specified) so the resolved value is visible on the confirmation
   * card and stored as part of the action input. Return the input unchanged
   * if no resolution is needed.
   */
  resolveInput?(input: unknown, ctx: { userId: string }): Promise<unknown>;
  /** Human-readable one-line result summary for the SSE stream. */
  summarize(output: unknown): string;
}

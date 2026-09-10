import type { AgentCard } from "@finai/ai-engine";
import type { AgentContext, AgentTool, ConfirmationPolicy, ToolAccess } from "./agent.types";

export interface ValidationWarning {
  /** Short label for the field, e.g. "Category". */
  field: string;
  /** Human-readable warning message. */
  message: string;
}

export interface ValidateContext {
  userId: string;
}

export interface DefineToolInput<T> {
  name: string;
  description: string;
  access: ToolAccess;
  confirmation: ConfirmationPolicy;
  /**
   * Zod schema validating the LLM-supplied input. Typed by its OUTPUT so
   * shared `@finai/validation` schemas with `.default()` fields infer T
   * correctly.
   */
  schema: import("zod").ZodType<T, import("zod").ZodTypeDef, unknown>;
  execute: (input: T, ctx: AgentContext) => Promise<unknown>;
  /**
   * Optional pre-confirmation validation. Runs at propose time (after schema
   * parse, before the card is shown). Use it to flag references that won't
   * resolve (e.g. a category name that doesn't exist) so the user sees a
   * warning on the confirm card instead of a hard failure after confirm.
   */
  validate?: (input: T, ctx: ValidateContext) => Promise<ValidationWarning[]>;
  /**
   * Pre-propose input resolution. Runs after schema parse + validation but
   * BEFORE the action is proposed and the confirmation card is built. Use this
   * to inject server-resolved values (e.g. the user's default account when
   * none was specified) so the resolved value is visible on the confirmation
   * card and stored as part of the action input. Return the input unchanged
   * if no resolution is needed.
   */
  resolveInput?: (input: T, ctx: ValidateContext) => Promise<T>;
  /** Optional custom serializer; defaults to returning the raw output. */
  serialize?: (output: unknown) => unknown;
  /** Optional human-readable confirmation card for write tools. */
  describe?: (input: T) => AgentCard;
  summarize: (output: unknown) => string;
}

/**
 * Factory that wires a typed Zod-validated executor into the runtime
 * `AgentTool` shape (input arrives as unknown from the LLM layer).
 */
export function defineTool<T>(def: DefineToolInput<T>): AgentTool {
  return {
    name: def.name,
    description: def.description,
    access: def.access,
    confirmation: def.confirmation,
    schema: def.schema,
    execute: (input: unknown, ctx: AgentContext) => def.execute(input as T, ctx),
    serialize: def.serialize ?? ((output: unknown) => output),
    // Safe cast: the input has always passed `schema.parse` (i.e. it is T).
    describe: def.describe as ((input: unknown) => AgentCard) | undefined,
    validate: def.validate as
      ((input: unknown, ctx: ValidateContext) => Promise<ValidationWarning[]>) | undefined,
    resolveInput: def.resolveInput as
      ((input: unknown, ctx: ValidateContext) => Promise<unknown>) | undefined,
    summarize: def.summarize,
  };
}

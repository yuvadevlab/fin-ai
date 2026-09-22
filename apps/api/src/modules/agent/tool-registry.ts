import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { LlmToolDefinition } from "@finai/ai-engine";
import type { AgentTool } from "./agent.types";

/**
 * Single source of truth for the tool catalog. Feeds both the LLM
 * (JSON-schema manifest) and the executor (validated dispatch).
 */
@Injectable()
export class ToolRegistry {
  private readonly logger = new Logger(ToolRegistry.name);
  private readonly tools = new Map<string, AgentTool>();

  /**
   * Adds a tool to the catalog. Duplicate names throw at registration time
   * (startup) rather than producing silent dispatch ambiguity later — a
   * name collision would mean the model's tool call could match two
   * different implementations.
   */
  register(tool: AgentTool): void {
    if (this.tools.has(tool.name)) {
      this.logger.error(`Duplicate agent tool registration attempted: ${tool.name}`);
      throw new Error(`Agent tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
    this.logger.log(`Registered agent tool: ${tool.name} [${tool.access}]`);
  }

  /** Registry lookup by exact tool name; undefined when the model invented a name. */
  get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  /** Snapshot of every registered tool (used for the tool-plan prompt listing). */
  list(): AgentTool[] {
    return [...this.tools.values()];
  }

  /**
   * Renders the catalog as the tool manifest sent to the LLM.
   *
   * Each Zod schema is converted to a JSON Schema so Ollama's native
   * function-calling format can describe the expected arguments.
   * `$refStrategy: "none"` inlines nested objects instead of emitting `$ref`
   * pointers — local models routinely fail to resolve `$ref`s, and inline
   * schemas keep the manifest self-contained.
   */
  toLlmDefinitions(): LlmToolDefinition[] {
    return this.list().map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.schema, {
        $refStrategy: "none",
      }) as Record<string, unknown>,
    }));
  }
}

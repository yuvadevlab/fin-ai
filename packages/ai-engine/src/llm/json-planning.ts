/**
 * JSON tool-planning fallback for Ollama models without native function calling.
 *
 * The model is instructed to emit tool calls inside a <tool_plan>…</tool_plan>
 * block. The orchestrator parses the block; `ToolPlanStreamFilter` suppresses
 * the block from the user-visible token stream.
 */

import { z } from "zod";
import type { LlmToolCall } from "./types";

export const TOOL_PLAN_OPEN = "<tool_plan>";
export const TOOL_PLAN_CLOSE = "</tool_plan>";

/** System-prompt suffix that teaches the model the tool-plan contract. */
export function buildToolPlanInstructions(toolNames: string[]): string {
  if (toolNames.length === 0) {
    return "You have no tools available. Answer in prose only.";
  }

  return `TOOL USAGE:
You can use the following tools: ${toolNames.join(", ")}.
To call one or more tools, respond with ONLY a single <tool_plan> block and nothing else:
${TOOL_PLAN_OPEN}
{"tool_calls":[{"name":"<tool.name>","arguments":{ ... }}]}
${TOOL_PLAN_CLOSE}
- "arguments" MUST be a JSON object matching the tool's JSON schema.
- You may include multiple tool_calls in one block; they will be executed in order.
- After tool results are provided, continue reasoning or answer the user.
- If no tool call is needed, answer directly in prose and NEVER emit a <tool_plan> block.
- NEVER wrap the plan in markdown code fences.`;
}

const toolPlanSchema = z.object({
  tool_calls: z
    .array(
      z.object({
        name: z.string().min(1),
        arguments: z.unknown().optional(),
      }),
    )
    .min(1),
});

function extractPlanBlock(content: string): string | null {
  const open = content.lastIndexOf(TOOL_PLAN_OPEN);
  if (open === -1) return null;
  const close = content.indexOf(TOOL_PLAN_CLOSE, open);
  if (close === -1) return null;
  return content.slice(open + TOOL_PLAN_OPEN.length, close).trim();
}

/**
 * Parse a <tool_plan> block from model output.
 * Returns null when the output contains no valid plan (i.e. it is a prose answer).
 */
export function parseToolPlan(content: string): LlmToolCall[] | null {
  if (!content || !content.includes(TOOL_PLAN_OPEN)) return null;

  const block = extractPlanBlock(content);
  if (!block) return null;

  // Tolerate markdown code fences around the JSON.
  const jsonText = block
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return null;
  }

  const result = toolPlanSchema.safeParse(parsed);
  if (!result.success) return null;

  return result.data.tool_calls.map((call, index) => ({
    id: `plan_${index + 1}`,
    name: call.name,
    arguments: JSON.stringify(call.arguments ?? {}),
  }));
}

/**
 * Streaming filter that hides <tool_plan>…</tool_plan> blocks (and partial
 * opening tags) from the user-visible token stream while still allowing the
 * orchestrator to accumulate the full raw output separately.
 */
export class ToolPlanStreamFilter {
  private buffer = "";
  private suppressing = false;

  push(text: string): string {
    this.buffer += text;
    let visible = "";

    for (;;) {
      if (!this.suppressing) {
        const open = this.buffer.indexOf(TOOL_PLAN_OPEN);
        if (open === -1) {
          const keep = partialSuffixLength(this.buffer, TOOL_PLAN_OPEN);
          const emitLength = this.buffer.length - keep;
          if (emitLength > 0) {
            visible += this.buffer.slice(0, emitLength);
            this.buffer = this.buffer.slice(emitLength);
          }
          return visible;
        }
        visible += this.buffer.slice(0, open);
        this.buffer = this.buffer.slice(open + TOOL_PLAN_OPEN.length);
        this.suppressing = true;
      } else {
        const close = this.buffer.indexOf(TOOL_PLAN_CLOSE);
        if (close === -1) {
          const keep = partialSuffixLength(this.buffer, TOOL_PLAN_CLOSE);
          this.buffer = this.buffer.slice(this.buffer.length - keep);
          return visible;
        }
        this.buffer = this.buffer.slice(close + TOOL_PLAN_CLOSE.length);
        this.suppressing = false;
      }
    }
  }

  /** Emit any remaining buffered text at end of stream. */
  flush(): string {
    if (this.suppressing) {
      this.buffer = "";
      return "";
    }
    const out = this.buffer;
    this.buffer = "";
    return out;
  }
}

/**
 * Compute how many trailing characters of `text` are also a prefix of `tag`.
 * This handles the case where a streamed token splits the opening or closing
 * `<tool_plan>` tag across multiple chunks, so we don't prematurely emit
 * partial tags to the user.
 */
function partialSuffixLength(text: string, tag: string): number {
  const max = Math.min(tag.length - 1, text.length);
  for (let k = max; k > 0; k--) {
    if (text.endsWith(tag.slice(0, k))) return k;
  }
  return 0;
}

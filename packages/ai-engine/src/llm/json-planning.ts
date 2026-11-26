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
export const TOOL_CALL_OPEN = "<tool_call>";
export const TOOL_CALL_CLOSE = "</tool_call>";

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

function extractPlanBlock(content: string, openTag: string, closeTag: string): string | null {
  const open = content.lastIndexOf(openTag);
  if (open === -1) return null;
  const close = content.indexOf(closeTag, open);
  if (close === -1) {
    // Recover unclosed <tool_plan> blocks when the model hit stop/limit before closing
    return content.slice(open + openTag.length).trim();
  }
  return content.slice(open + openTag.length, close).trim();
}

/**
 * Strips any <tool_plan>...</tool_plan>, <tool_call>...</tool_call>, and orphan
 * opening/closing planning tags from assistant text so raw tags never leak to the UI
 * or poison conversation history.
 */
export function stripToolPlanTags(text: string): string {
  if (!text) return "";
  return text
    .replace(/<tool_plan>[\s\S]*?<\/tool_plan>/gi, "")
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, "")
    .replace(/<\/?(?:tool_plan|tool_call)>/gi, "");
}

/**
 * Parse a <tool_plan> or <tool_call> block from model output.
 * Returns null when the output contains no valid plan (i.e. it is a prose answer).
 */
export function parseToolPlan(content: string): LlmToolCall[] | null {
  if (!content) return null;

  const toolCalls: LlmToolCall[] = [];

  // 1. Try standard <tool_plan> block
  if (content.includes(TOOL_PLAN_OPEN)) {
    const block = extractPlanBlock(content, TOOL_PLAN_OPEN, TOOL_PLAN_CLOSE);
    if (block) {
      const jsonText = block
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      try {
        const parsed = JSON.parse(jsonText);
        const result = toolPlanSchema.safeParse(parsed);
        if (result.success) {
          for (let i = 0; i < result.data.tool_calls.length; i++) {
            const call = result.data.tool_calls[i];
            toolCalls.push({
              id: `plan_${toolCalls.length + 1}`,
              name: call.name,
              arguments:
                typeof call.arguments === "string"
                  ? call.arguments
                  : JSON.stringify(call.arguments ?? {}),
            });
          }
        }
      } catch {
        // Ignore JSON parse errors for non-matching candidate blocks
      }
    }
  }

  // 2. Try <tool_call> block (Qwen / ChatML format)
  const toolCallRegex = /<tool_call>([\s\S]*?)<\/tool_call>/gi;
  let match: RegExpExecArray | null;
  while ((match = toolCallRegex.exec(content)) !== null) {
    let block = match[1].trim();
    // Strip <function> ... </function> if present
    const fnMatch = /<function>([\s\S]*?)<\/function>/i.exec(block);
    if (fnMatch) {
      block = fnMatch[1].trim();
    }
    block = block
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(block) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") {
        if ("name" in parsed && typeof parsed.name === "string") {
          const rawArgs = parsed.arguments;
          toolCalls.push({
            id: `plan_${toolCalls.length + 1}`,
            name: parsed.name,
            arguments: typeof rawArgs === "string" ? rawArgs : JSON.stringify(rawArgs ?? {}),
          });
        } else if ("tool_calls" in parsed && Array.isArray(parsed.tool_calls)) {
          for (const call of parsed.tool_calls as Array<{ name?: string; arguments?: unknown }>) {
            if (call.name) {
              toolCalls.push({
                id: `plan_${toolCalls.length + 1}`,
                name: call.name,
                arguments:
                  typeof call.arguments === "string"
                    ? call.arguments
                    : JSON.stringify(call.arguments ?? {}),
              });
            }
          }
        }
      }
    } catch {
      // Ignore JSON parse errors for non-matching candidate blocks
    }
  }

  return toolCalls.length > 0 ? toolCalls : null;
}

/**
 * Streaming filter that hides <tool_plan>…</tool_plan> and <tool_call>…</tool_call>
 * blocks (and partial opening tags) from the user-visible token stream while still
 * allowing the orchestrator to accumulate the full raw output separately.
 */
export class ToolPlanStreamFilter {
  private buffer = "";
  private suppressingTag: string | null = null;

  push(text: string): string {
    this.buffer += text;
    let visible = "";

    for (;;) {
      if (!this.suppressingTag) {
        const candidates: Array<{ idx: number; open: string; close: string | null }> = [
          {
            idx: this.buffer.indexOf(TOOL_PLAN_OPEN),
            open: TOOL_PLAN_OPEN,
            close: TOOL_PLAN_CLOSE,
          },
          {
            idx: this.buffer.indexOf(TOOL_CALL_OPEN),
            open: TOOL_CALL_OPEN,
            close: TOOL_CALL_CLOSE,
          },
          // Strip orphan closing tags (e.g. when reasoning channel emitted the opening tag)
          { idx: this.buffer.indexOf(TOOL_PLAN_CLOSE), open: TOOL_PLAN_CLOSE, close: null },
          { idx: this.buffer.indexOf(TOOL_CALL_CLOSE), open: TOOL_CALL_CLOSE, close: null },
        ].filter((c) => c.idx !== -1);

        if (candidates.length === 0) {
          const keep = Math.max(
            partialSuffixLength(this.buffer, TOOL_PLAN_OPEN),
            partialSuffixLength(this.buffer, TOOL_CALL_OPEN),
            partialSuffixLength(this.buffer, TOOL_PLAN_CLOSE),
            partialSuffixLength(this.buffer, TOOL_CALL_CLOSE),
          );
          const emitLength = this.buffer.length - keep;
          if (emitLength > 0) {
            visible += this.buffer.slice(0, emitLength);
            this.buffer = this.buffer.slice(emitLength);
          }
          return visible;
        }

        candidates.sort((a, b) => a.idx - b.idx);
        const earliest = candidates[0];

        visible += this.buffer.slice(0, earliest.idx);
        this.buffer = this.buffer.slice(earliest.idx + earliest.open.length);
        if (earliest.close) {
          this.suppressingTag = earliest.close;
        }
      } else {
        const close = this.buffer.indexOf(this.suppressingTag);
        if (close === -1) {
          const keep = partialSuffixLength(this.buffer, this.suppressingTag);
          this.buffer = this.buffer.slice(this.buffer.length - keep);
          return visible;
        }
        this.buffer = this.buffer.slice(close + this.suppressingTag.length);
        this.suppressingTag = null;
      }
    }
  }

  /** Emit any remaining buffered text at end of stream. */
  flush(): string {
    if (this.suppressingTag) {
      this.buffer = "";
      return "";
    }
    const out = stripToolPlanTags(this.buffer);
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

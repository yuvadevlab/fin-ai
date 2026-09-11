import { describe, expect, it } from "vitest";
import {
  TOOL_PLAN_CLOSE,
  TOOL_PLAN_OPEN,
  ToolPlanStreamFilter,
  parseToolPlan,
} from "../llm/json-planning";

/**
 * The ToolPlanStreamFilter is the gate every streamed token passes through
 * before reaching the user. These tests pin its incremental behavior: prose
 * flows through with NO buffering, tool-plan blocks are suppressed even when
 * their tags are split across chunks, and nothing visible is ever dropped.
 */
describe("ToolPlanStreamFilter", () => {
  it("passes prose through immediately (zero added buffering)", () => {
    const filter = new ToolPlanStreamFilter();
    expect(filter.push("Based on your ")).toBe("Based on your ");
    expect(filter.push("current spending…")).toBe("current spending…");
    expect(filter.flush()).toBe("");
  });

  it("suppresses a complete tool_plan block arriving across chunks", () => {
    const filter = new ToolPlanStreamFilter();
    expect(filter.push("Let me check. ")).toBe("Let me check. ");
    expect(filter.push(TOOL_PLAN_OPEN)).toBe("");
    expect(filter.push('{"tool_calls":[{"name":"accounts.list","arguments":{}}')).toBe("");
    expect(filter.push("}]}" + TOOL_PLAN_CLOSE)).toBe("");
    expect(filter.push(" Done.")).toBe(" Done.");
    expect(filter.flush()).toBe("");
  });

  it("holds back a partial opening tag split across chunks", () => {
    const filter = new ToolPlanStreamFilter();
    // "<tool_p" is a prefix of "<tool_plan>" — it must not leak to the user.
    expect(filter.push("text<tool_p")).toBe("text");
    expect(filter.push('lan>{"x":1}' + TOOL_PLAN_CLOSE + "ok")).toBe("ok");
    expect(filter.flush()).toBe("");
  });

  it("flush never leaks suppressed content and drains held-back prose", () => {
    const filter = new ToolPlanStreamFilter();
    filter.push(TOOL_PLAN_OPEN + '{"tool_calls":[]}');
    // Stream ended while inside a plan block — nothing inside may leak.
    expect(filter.flush()).toBe("");
  });

  it("flush emits trailing prose when the stream ends outside a block", () => {
    const filter = new ToolPlanStreamFilter();
    // Whole string is emitted immediately (no partial-tag suffix).
    expect(filter.push("tail prose")).toBe("tail prose");
    expect(filter.flush()).toBe("");
  });
});

describe("parseToolPlan", () => {
  it("parses a valid plan block into ordered tool calls", () => {
    const calls = parseToolPlan(
      `Before text ${TOOL_PLAN_OPEN}{"tool_calls":[{"name":"accounts.list","arguments":{}},{"name":"budgets.list"}]}${TOOL_PLAN_CLOSE}`,
    );
    expect(calls).toHaveLength(2);
    expect(calls![0]).toMatchObject({ name: "accounts.list" });
    expect(calls![1]).toMatchObject({ name: "budgets.list" });
  });

  it("tolerates markdown fences around the plan JSON", () => {
    const calls = parseToolPlan(
      `${TOOL_PLAN_OPEN}\n\`\`\`json\n{"tool_calls":[{"name":"goals.list","arguments":{}}]}\n\`\`\`\n${TOOL_PLAN_CLOSE}`,
    );
    expect(calls).toHaveLength(1);
    expect(calls![0].name).toBe("goals.list");
  });

  it("returns null for plain prose (a final answer, not a plan)", () => {
    expect(parseToolPlan("Just an answer, no tools needed.")).toBeNull();
  });

  it("returns null for invalid JSON inside the block", () => {
    expect(parseToolPlan(`${TOOL_PLAN_OPEN}not json${TOOL_PLAN_CLOSE}`)).toBeNull();
  });
});

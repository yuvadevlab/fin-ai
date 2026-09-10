import { describe, expect, it } from "vitest";
import { buildAgentSystemPrompt } from "../agent/agent-prompt";

/**
 * Pins the advisor-first behavior contract in the agent system prompt.
 * These directives are the fix for the task-generator behavior (generic
 * Next Steps checklists, internal tool-name leaks) — regressions here
 * directly change agent personality.
 */
describe("buildAgentSystemPrompt", () => {
  const base = {
    portfolioSnapshot: "SNAPSHOT-CONTENT",
    toolPlanInstructions: "TOOL-PLAN-INSTRUCTIONS",
    currentDate: "2026-09-06",
  };

  it("keeps the advisor-first contract: advise first, never invent work", () => {
    const prompt = buildAgentSystemPrompt(base);
    expect(prompt).toContain("ADVISOR-FIRST BEHAVIOR");
    expect(prompt).toContain("NOT a task generator");
    expect(prompt).toContain("No urgent action is recommended.");
    expect(prompt).toContain("Do not invent work");
    expect(prompt).toContain("Distinguish advice from execution");
  });

  it("forbids exposing internal tool names and mandates question follow-ups", () => {
    const prompt = buildAgentSystemPrompt(base);
    expect(prompt).toContain("COMMUNICATION CONTRACT");
    expect(prompt).toContain("budgets.create");
    expect(prompt).toContain("<tool_plan>");
    expect(prompt).toContain("### Follow-up Suggestions:");
  });

  it("embeds the grounding snapshot, current date and tool-plan contract", () => {
    const prompt = buildAgentSystemPrompt(base);
    expect(prompt).toContain("SNAPSHOT-CONTENT");
    expect(prompt).toContain("2026-09-06");
    expect(prompt).toContain("TOOL-PLAN-INSTRUCTIONS");
  });

  it("injects entity memory and pending-action sections when provided", () => {
    const prompt = buildAgentSystemPrompt({
      ...base,
      entityMemory: "ENTITY-MEMORY-SECTION",
      pendingAction: "PENDING-ACTION-SECTION",
    });
    expect(prompt).toContain("ENTITY-MEMORY-SECTION");
    expect(prompt).toContain("PENDING-ACTION-SECTION");
  });

  it("keeps write-action safety: confirmation before mutation", () => {
    const prompt = buildAgentSystemPrompt(base);
    expect(prompt).toContain("WRITE-ACTION SAFETY");
    expect(prompt).toContain("NEVER say the change is already done");
  });
});

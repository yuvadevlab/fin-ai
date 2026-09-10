import { describe, expect, it } from "vitest";
import type { AgentActivity } from "@/features/ai-advisor/api/agentTypes";
import {
  activityLabel,
  deriveRunState,
  formatDuration,
  standbyLabel,
} from "@/features/ai-advisor/utils/deriveRunState";

function step(overrides: Partial<AgentActivity>): AgentActivity {
  return { tool: "transactions.list", status: "running", ...overrides };
}

describe("activityLabel", () => {
  it("maps unit lifecycle phase rows to user-safe labels", () => {
    expect(activityLabel(step({ tool: "phase:agent_started", kind: "phase" }))).toBe(
      "Understanding your question",
    );
    expect(activityLabel(step({ tool: "phase:loading_context:0", kind: "phase" }))).toBe(
      "Loading financial context",
    );
    expect(activityLabel(step({ tool: "phase:model_turn:1", kind: "phase" }))).toBe(
      "Understanding your request",
    );
    expect(activityLabel(step({ tool: "phase:model_turn:2", kind: "phase" }))).toBe(
      "Thinking through the next step",
    );
  });

  it("labels approval and tool rows without leaking internal names", () => {
    expect(activityLabel(step({ tool: "approval:a1", kind: "approval" }))).toBe(
      "Waiting for your approval",
    );
    expect(activityLabel(step({ tool: "accounts.list", kind: "tool" }))).toBe(
      "Reviewing your accounts",
    );
    expect(activityLabel(step({ tool: "transactions.bulkCreate", kind: "tool" }))).toBe(
      "Recording your transaction",
    );
  });

  it("honors an explicit label override over the mapping", () => {
    expect(activityLabel(step({ label: "Custom step" }))).toBe("Custom step");
  });
});

describe("standbyLabel", () => {
  it("only claims streaming once text is actually flowing", () => {
    expect(standbyLabel(false)).toBe("FinAI is working");
    expect(standbyLabel(true)).toBe("Streaming your answer");
  });
});

describe("formatDuration", () => {
  it("formats millisecond durations human-readably", () => {
    expect(formatDuration(450)).toBe("450ms");
    expect(formatDuration(6400)).toBe("6.4s");
    expect(formatDuration(65_000)).toBe("1m 5s");
  });
});

describe("deriveRunState", () => {
  const t0 = 1_000_000;

  it("counts only resolved steps and tracks errors", () => {
    const list = [
      step({ status: "success" }),
      step({ status: "error", tool: "accounts.list" }),
      step({ status: "running", tool: "budgets.list" }),
    ];
    const state = deriveRunState(list, true);

    expect(state.isActive).toBe(true);
    expect(state.completedCount).toBe(2);
    expect(state.totalCount).toBe(3);
    expect(state.hasError).toBe(true);
    expect(state.currentTool).toBe("budgets.list");
    expect(state.statusLabel).toBe("Reviewing budgets");
  });

  it("stays open while streaming and completes only after stream close + resolution", () => {
    const resolved = [step({ status: "success" })];
    expect(deriveRunState(resolved, true).isComplete).toBe(false);
    expect(deriveRunState(resolved, false).isComplete).toBe(true);
    expect(deriveRunState([step({ status: "running" })], false).isComplete).toBe(false);
  });

  it("computes total run duration from first start to last completion", () => {
    const list = [
      step({ status: "success", startedAt: t0, completedAt: t0 + 400 }),
      step({ status: "success", startedAt: t0 + 500, completedAt: t0 + 2_000 }),
    ];
    const state = deriveRunState(list, false);

    expect(state.durationMs).toBe(2_000);
  });

  it("uses the honest 'thinking' label before the first real event arrives", () => {
    const state = deriveRunState([], true);
    expect(state.statusLabel).toBe("FinAI is thinking…");
  });
});

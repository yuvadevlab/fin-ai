import { describe, expect, it, vi } from "vitest";
import type { AgentStreamEvent } from "@finai/ai-engine";
import {
  handleAgentStreamEvent,
  phaseKey,
  type AgentEventPort,
} from "@/features/ai-advisor/api/agentEventHandlers";

function createPort(): AgentEventPort {
  return {
    appendText: vi.fn(),
    replaceText: vi.fn(),
    appendActivity: vi.fn(),
    updateActivity: vi.fn(),
    resolveApprovalActivity: vi.fn(),
    appendConfirmation: vi.fn(),
    updateConfirmationStatus: vi.fn(),
    updateConfirmationCard: vi.fn(),
    failStream: vi.fn(),
    endStream: vi.fn(),
    onConversation: vi.fn(),
  };
}

describe("handleAgentStreamEvent", () => {
  it("maps the run event to the opening 'Understanding your question' step", () => {
    const port = createPort();
    const terminal = handleAgentStreamEvent({ type: "run", runId: "r1" }, port);

    expect(terminal).toBe(false);
    expect(port.appendActivity).toHaveBeenCalledWith({
      tool: "phase:agent_started",
      kind: "phase",
      status: "running",
    });
  });

  it("resolves the run-start step the moment context loading begins", () => {
    const port = createPort();
    handleAgentStreamEvent({ type: "phase", phase: "loading_context", status: "start" }, port);

    expect(port.updateActivity).toHaveBeenCalledWith("phase:agent_started", { status: "success" });
    expect(port.appendActivity).toHaveBeenCalledWith({
      tool: "phase:loading_context:0",
      kind: "phase",
      status: "running",
    });
  });

  it("reuses one stable key across phase start/end so ◌ flips to ✓", () => {
    const port = createPort();
    handleAgentStreamEvent({ type: "phase", phase: "model_turn", status: "start", turn: 1 }, port);
    handleAgentStreamEvent(
      { type: "phase", phase: "model_turn", status: "end", turn: 1, toolCalls: 1 },
      port,
    );

    expect(port.appendActivity).toHaveBeenCalledWith({
      tool: "phase:model_turn:1",
      kind: "phase",
      status: "running",
    });
    expect(port.updateActivity).toHaveBeenCalledWith(phaseKey("model_turn", 1), {
      status: "success",
      detail: "Selected 1 step for execution",
    });
  });

  it("marks a tool-less final turn as 'Prepared your answer' — never pre-completed", () => {
    const port = createPort();
    handleAgentStreamEvent(
      { type: "phase", phase: "model_turn", status: "end", turn: 2, toolCalls: 0 },
      port,
    );

    expect(port.updateActivity).toHaveBeenCalledWith("phase:model_turn:2", {
      status: "success",
      detail: "Prepared your answer",
    });
  });

  it("maps tool_call → running and tool_result → success with the server summary", () => {
    const port = createPort();
    handleAgentStreamEvent({ type: "tool_call", tool: "accounts.list", runId: "r1" }, port);
    handleAgentStreamEvent(
      { type: "tool_result", tool: "accounts.list", ok: true, summary: "Found 3 account(s)" },
      port,
    );

    expect(port.appendActivity).toHaveBeenCalledWith({
      tool: "accounts.list",
      kind: "tool",
      status: "running",
    });
    expect(port.updateActivity).toHaveBeenCalledWith("accounts.list", {
      status: "success",
      summary: "Found 3 account(s)",
    });
  });

  it("flips a failed tool to ✕ without a success summary", () => {
    const port = createPort();
    handleAgentStreamEvent(
      {
        type: "tool_result",
        tool: "budgets.list",
        ok: false,
        summary: "Budget service unavailable",
      },
      port,
    );

    expect(port.updateActivity).toHaveBeenCalledWith("budgets.list", {
      status: "error",
      summary: "Budget service unavailable",
    });
  });

  it("opens a persistent 'Waiting for your approval' step on confirmation_required", () => {
    const port = createPort();
    handleAgentStreamEvent(
      {
        type: "confirmation_required",
        actionId: "a1",
        tool: "transactions.recordFood",
        card: { type: "confirmation", title: "Add transaction" },
      },
      port,
    );

    expect(port.appendActivity).toHaveBeenCalledWith({
      tool: "approval:a1",
      kind: "approval",
      status: "running",
      label: "Waiting for your approval",
    });
    expect(port.appendConfirmation).toHaveBeenCalledWith({
      actionId: "a1",
      tool: "transactions.recordFood",
      card: { type: "confirmation", title: "Add transaction" },
      status: "pending",
    });
  });

  it("resolves the approval step only on an explicit action result", () => {
    const port = createPort();
    handleAgentStreamEvent({ type: "action_result", actionId: "a1", ok: true }, port);

    expect(port.updateConfirmationStatus).toHaveBeenCalledWith("a1", "executed");
    expect(port.resolveApprovalActivity).toHaveBeenCalledWith("a1", {
      status: "success",
      summary: "Action completed",
    });
  });

  it("streams token deltas by appending to the active message", () => {
    const port = createPort();

    // The backend protocol sends DELTA chunks — each token event appends.
    handleAgentStreamEvent({ type: "token", content: "Based on" }, port);
    handleAgentStreamEvent({ type: "token", content: " your current" }, port);
    handleAgentStreamEvent({ type: "token", content: " spending" }, port);

    expect(port.appendText).toHaveBeenNthCalledWith(1, "Based on");
    expect(port.appendText).toHaveBeenNthCalledWith(2, " your current");
    expect(port.appendText).toHaveBeenNthCalledWith(3, " spending");
    expect(port.replaceText).not.toHaveBeenCalled();
  });

  it("replaces streamed text on token_replace (confirmation grounding)", () => {
    const port = createPort();
    const standardized =
      "I've proposed an action for your confirmation. Please review the details on the card and confirm or reject.";

    // Pre-tool prose streamed first...
    handleAgentStreamEvent({ type: "token", content: "Adding ₹500 to Transport now." }, port);
    // ...then a write tool required confirmation → the runner supersedes the
    // prose with the grounded message via REPLACE semantics (never append,
    // never a second message).
    const terminal = handleAgentStreamEvent({ type: "token_replace", content: standardized }, port);

    expect(terminal).toBe(false);
    expect(port.replaceText).toHaveBeenCalledTimes(1);
    expect(port.replaceText).toHaveBeenCalledWith(standardized);
  });

  it("does not treat a token_replace as terminal and continues the stream", () => {
    const port = createPort();
    const terminal = handleAgentStreamEvent({ type: "token_replace", content: "x" }, port);
    expect(terminal).toBe(false);
  });

  it("ignores unknown/forward-compatible event types without side effects", () => {
    const port = createPort();
    const terminal = handleAgentStreamEvent(
      { type: "usage", tokensIn: 1, tokensOut: 2 } as AgentStreamEvent,
      port,
    );

    expect(terminal).toBe(false);
    expect(port.appendActivity).not.toHaveBeenCalled();
    expect(port.appendText).not.toHaveBeenCalled();
  });

  it("returns true only for terminal events", () => {
    const port = createPort();
    expect(handleAgentStreamEvent({ type: "done" }, port)).toBe(true);
    expect(handleAgentStreamEvent({ type: "error", error: "boom", code: "E_LLM" }, port)).toBe(
      true,
    );
  });
});

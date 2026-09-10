import type { AgentCard, AgentStreamEvent } from "@finai/ai-engine";
import type { AgentActivity, AgentConfirmation, AgentConfirmationStatus } from "./agentTypes";

/**
 * Stable key for a phase activity so its start and end events land on the
 * same row. Phase rows are synthetic activities (`kind: "phase"`) rendered
 * through the centralized label mapper — they are real lifecycle transitions
 * emitted by the server, never timer-driven placeholders.
 */
export function phaseKey(phase: string, turn?: number, pendingAction?: boolean): string {
  return `phase:${phase}:${turn ?? 0}${pendingAction ? ":pending" : ""}`;
}

/** Stable key for the "waiting for approval" activity of one proposed action. */
export function approvalKey(actionId: string): string {
  return `approval:${actionId}`;
}

/**
 * The slice of message state the event stream drives. Implemented by
 * `useAgentMessages`; kept as an interface so the switch below stays a pure,
 * testable mapper (requirement: centralized event → UI mapping).
 */
export interface AgentEventPort {
  appendText(content: string): void;
  /**
   * Replace the accumulated text of the current assistant message (used by
   * `token_replace` when grounded confirmation text supersedes streamed
   * prose). Must NOT append — see the `token_replace` protocol docs.
   */
  replaceText(content: string): void;
  appendActivity(activity: AgentActivity): void;
  updateActivity(toolKey: string, patch: Partial<AgentActivity>): void;
  /** Patch an approval step by actionId across ALL messages (not just the last). */
  resolveApprovalActivity(actionId: string, patch: Partial<AgentActivity>): void;
  appendConfirmation(confirmation: AgentConfirmation): void;
  updateConfirmationStatus(actionId: string, status: AgentConfirmationStatus): void;
  updateConfirmationCard(actionId: string, card: AgentCard): void;
  failStream(error: string): void;
  endStream(): void;
  onConversation(conversationId: string): void;
}

/**
 * Applies one SSE `AgentStreamEvent` to the message state. Every activity the
 * UI shows originates here — from real backend events only. Nothing is
 * synthesized on timers, and unknown event types are ignored for forward
 * compatibility.
 *
 * @returns `true` when the stream is terminal (`done`/`error`) and the read
 * loop should stop.
 */
export function handleAgentStreamEvent(event: AgentStreamEvent, port: AgentEventPort): boolean {
  switch (event.type) {
    case "conversation":
      port.onConversation(event.conversationId);
      return false;

    case "run":
      // The real "agent started" signal — opens the first honest step
      // ("◌ Understanding your question…"). It flips to ✓ when context
      // loading begins (see the `phase` handler). Purely event-driven,
      // never timer-based.
      port.appendActivity({ tool: "phase:agent_started", kind: "phase", status: "running" });
      return false;

    case "token":
      // The answer is streaming. Deltas APPEND (the backend sends delta
      // chunks, not cumulative snapshots). The preceding model_turn phase
      // row has already flipped to ✓ via its own end event — no fabrication
      // here.
      port.appendText(event.content);
      return false;

    case "token_replace":
      // Grounding: prose that streamed before tool execution is superseded
      // by the server's standardized confirmation message. REPLACE the
      // message text (never append) so pre-tool hallucinations cannot
      // survive next to the card, and so no duplicate final message is
      // created.
      port.replaceText(event.content);
      return false;

    case "phase": {
      const key = phaseKey(event.phase, event.turn, event.pendingAction);
      if (event.status === "start") {
        if (event.phase === "loading_context") {
          // Context assembly has begun — the run-start step ("Understanding
          // your question") is genuinely resolved as of that moment.
          port.updateActivity("phase:agent_started", { status: "success" });
        }
        // ○ → ◌ the moment the server enters the phase (context loading or
        // LLM inference). Rendered immediately as the running step.
        port.appendActivity({ tool: key, kind: "phase", status: "running" });
      } else {
        // ◌ → ✓ exactly when the server leaves the phase.
        const patch: Partial<AgentActivity> = { status: "success" };
        // `toolCalls` rides on the `model_turn` end event only: 0 means the
        // final answer is about to stream, >0 means N tools are about to
        // execute. Either way it is the true next step, and the detail line
        // surfaces it in the expanded view (never invented client-side).
        if (event.toolCalls !== undefined) {
          patch.detail =
            event.toolCalls === 0
              ? "Prepared your answer"
              : `Selected ${event.toolCalls} step${event.toolCalls === 1 ? "" : "s"} for execution`;
        }
        port.updateActivity(key, patch);
      }
      return false;
    }

    case "tool_call":
      port.appendActivity({ tool: event.tool, kind: "tool", status: "running" });
      return false;

    case "tool_result":
      port.updateActivity(event.tool, {
        status: event.ok ? "success" : "error",
        summary: event.summary,
      });
      return false;

    case "confirmation_required":
      // Write tools never emit tool_result — the proposal IS the result. Flip
      // the proposing tool row to ✓, then open the approval step (◌) which
      // stays running until the user explicitly confirms or rejects.
      port.updateActivity(event.tool, {
        status: "success",
        summary: "Ready for your approval",
      });
      port.appendActivity({
        tool: approvalKey(event.actionId),
        kind: "approval",
        status: "running",
        label: "Waiting for your approval",
      });
      port.appendConfirmation({
        actionId: event.actionId,
        tool: event.tool,
        card: event.card,
        status: "pending",
      });
      return false;

    case "action_updated":
      // Conversational edit: replace the card in place (never a duplicate).
      // The approval step keeps running — the action is still unexecuted.
      port.updateConfirmationCard(event.actionId, event.card);
      return false;

    case "action_result":
      port.updateConfirmationStatus(event.actionId, event.ok ? "executed" : "failed");
      port.resolveApprovalActivity(event.actionId, {
        status: event.ok ? "success" : "error",
        summary: event.ok ? "Action completed" : "Action failed",
      });
      return false;

    case "error":
      port.failStream(event.error);
      return true;

    case "done":
      port.endStream();
      return true;

    default:
      // run / usage / card — no chat-activity representation.
      return false;
  }
}

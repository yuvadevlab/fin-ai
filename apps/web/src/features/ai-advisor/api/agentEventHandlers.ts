import type { AgentCard, AgentStreamEvent } from "@finai/ai-engine";
import type {
  AgentActivity,
  AgentConfirmation,
  AgentConfirmationStatus,
  AgentResolvedMode,
  AgentRunLogEntry,
} from "./agentTypes";

let runStartTime = Date.now();

function makeLog(
  level: AgentRunLogEntry["level"],
  message: string,
  detail?: string,
): AgentRunLogEntry {
  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now,
    elapsedMs: Math.max(0, now - runStartTime),
    level,
    message,
    detail,
  };
}

export function phaseKey(phase: string, turn?: number, pendingAction?: boolean): string {
  return `phase:${phase}:${turn ?? 0}${pendingAction ? ":pending" : ""}`;
}

export function approvalKey(actionId: string): string {
  return `approval:${actionId}`;
}

export interface AgentEventPort {
  appendLog?(log: AgentRunLogEntry): void;
  appendText(content: string): void;
  replaceText(content: string): void;
  appendActivity(activity: AgentActivity): void;
  updateActivity(toolKey: string, patch: Partial<AgentActivity>): void;
  resolveApprovalActivity(actionId: string, patch: Partial<AgentActivity>): void;
  appendConfirmation(confirmation: AgentConfirmation): void;
  updateConfirmationStatus(actionId: string, status: AgentConfirmationStatus): void;
  updateConfirmationCard(actionId: string, card: AgentCard): void;
  failStream(error: string): void;
  endStream(): void;
  onConversation(conversationId: string): void;
  /** Set once per run after routing resolves — which runtime answered. */
  onMode?(mode: AgentResolvedMode): void;
}

export function handleAgentStreamEvent(event: AgentStreamEvent, port: AgentEventPort): boolean {
  switch (event.type) {
    case "conversation":
      port.onConversation(event.conversationId);
      return false;

    case "run":
      runStartTime = Date.now();
      port.appendLog?.(makeLog("SYS", `Agent run initialized: ${event.runId.slice(0, 8)}`));
      port.appendActivity({ tool: "phase:agent_started", kind: "phase", status: "running" });
      return false;

    case "mode":
      port.appendLog?.(
        makeLog(
          "SYS",
          event.mode === "agent"
            ? "Agent mode — tools & actions enabled"
            : "Advisor mode — conversational fast reply",
        ),
      );
      port.onMode?.(event.mode);
      return false;

    case "token":
      port.appendText(event.content);
      return false;

    case "token_replace":
      port.replaceText(event.content);
      port.appendLog?.(makeLog("STREAM", "Grounded response replaced pre-action tokens"));
      return false;

    case "phase": {
      const key = phaseKey(event.phase, event.turn, event.pendingAction);
      if (event.status === "start") {
        if (event.phase === "loading_context") {
          port.updateActivity("phase:agent_started", { status: "success" });
          port.appendLog?.(makeLog("CTX", "Loading accounts, budgets, goals & monthly cashflow"));
        } else if (event.phase === "model_turn") {
          port.appendLog?.(
            makeLog(
              "LLM",
              `Reasoning & planning (Turn ${event.turn ?? 1})`,
              "LLM inference started",
            ),
          );
        }
        port.appendActivity({ tool: key, kind: "phase", status: "running" });
      } else {
        const patch: Partial<AgentActivity> = { status: "success" };
        if (event.toolCalls !== undefined) {
          patch.detail =
            event.toolCalls === 0
              ? "Prepared your answer"
              : `Selected ${event.toolCalls} step${event.toolCalls === 1 ? "" : "s"} for execution`;
          port.appendLog?.(
            makeLog(
              "LLM",
              event.toolCalls === 0
                ? "Direct answer synthesis selected"
                : `Model planned ${event.toolCalls} tool execution${event.toolCalls === 1 ? "" : "s"}`,
            ),
          );
        } else if (event.phase === "loading_context") {
          port.appendLog?.(makeLog("CTX", "Financial context loaded & grounded"));
        }
        port.updateActivity(key, patch);
      }
      return false;
    }

    case "tool_call":
      port.appendLog?.(makeLog("TOOL", `Invoking ${event.tool}...`));
      port.appendActivity({ tool: event.tool, kind: "tool", status: "running" });
      return false;

    case "tool_result":
      port.appendLog?.(
        makeLog(
          "TOOL",
          `${event.tool} ${event.ok ? "✓" : "✕"}`,
          event.summary ?? (event.ok ? "Completed" : "Error"),
        ),
      );
      port.updateActivity(event.tool, {
        status: event.ok ? "success" : "error",
        summary: event.summary,
      });
      return false;

    case "confirmation_required":
      port.appendLog?.(
        makeLog("ACTION", `Action proposal: ${event.card.title}`, "Awaiting user confirmation"),
      );
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
      port.appendLog?.(makeLog("ACTION", `Updated action: ${event.card.title}`));
      port.updateConfirmationCard(event.actionId, event.card);
      return false;

    case "action_result":
      port.appendLog?.(
        makeLog("ACTION", `Action ${event.ok ? "confirmed & executed" : "rejected/failed"}`),
      );
      port.updateConfirmationStatus(event.actionId, event.ok ? "executed" : "failed");
      port.resolveApprovalActivity(event.actionId, {
        status: event.ok ? "success" : "error",
        summary: event.ok ? "Action completed" : "Action failed",
      });
      return false;

    case "usage":
      port.appendLog?.(
        makeLog("SYS", `Tokens processed: in=${event.tokensIn} out=${event.tokensOut}`),
      );
      return false;

    case "error":
      port.appendLog?.(makeLog("ERR", `Stream error: ${event.error}`));
      port.failStream(event.error);
      return true;

    case "done":
      port.appendLog?.(makeLog("DONE", "Agent run finished successfully"));
      port.endStream();
      return true;

    default:
      return false;
  }
}

import type { AgentStreamEvent } from "@finai/ai-engine";
import {
  AgentActivityKind,
  AgentActivityStatus,
  AgentConfirmationStatus,
  AgentRunLogLevel,
} from "@finai/shared-types";
import type { AgentActivity } from "./agentTypes";
import {
  AgentEventPort,
  approvalKey,
  makeLog,
  phaseKey,
  resetRunStartTime,
} from "./agentEventPort";

export { phaseKey, approvalKey, type AgentEventPort };

export function handleAgentStreamEvent(event: AgentStreamEvent, port: AgentEventPort): boolean {
  switch (event.type) {
    case "conversation":
      port.onConversation(event.conversationId);
      return false;

    case "title":
      port.onTitle?.(event.title);
      return false;

    case "run":
      resetRunStartTime();
      port.appendLog?.(
        makeLog(AgentRunLogLevel.SYS, `Agent run initialized: ${event.runId.slice(0, 8)}`),
      );
      port.appendActivity({
        tool: "phase:agent_started",
        kind: AgentActivityKind.PHASE,
        status: AgentActivityStatus.RUNNING,
      });
      return false;

    case "mode":
      port.appendLog?.(
        makeLog(
          AgentRunLogLevel.SYS,
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
      port.appendLog?.(
        makeLog(AgentRunLogLevel.STREAM, "Grounded response replaced pre-action tokens"),
      );
      return false;

    case "phase": {
      const key = phaseKey(event.phase, event.turn, event.pendingAction);
      if (event.status === "start") {
        if (event.phase === "loading_context") {
          port.updateActivity("phase:agent_started", { status: AgentActivityStatus.SUCCESS });
          port.appendLog?.(
            makeLog(AgentRunLogLevel.CTX, "Loading accounts, budgets, goals & monthly cashflow"),
          );
        } else if (event.phase === "model_turn") {
          port.appendLog?.(
            makeLog(
              AgentRunLogLevel.LLM,
              `Reasoning & planning (Turn ${event.turn ?? 1})`,
              "LLM inference started",
            ),
          );
        }
        port.appendActivity({
          tool: key,
          kind: AgentActivityKind.PHASE,
          status: AgentActivityStatus.RUNNING,
        });
      } else {
        const patch: Partial<AgentActivity> = { status: AgentActivityStatus.SUCCESS };
        if (event.toolCalls !== undefined) {
          patch.detail =
            event.toolCalls === 0
              ? "Prepared your answer"
              : `Selected ${event.toolCalls} step${event.toolCalls === 1 ? "" : "s"} for execution`;
          port.appendLog?.(
            makeLog(
              AgentRunLogLevel.LLM,
              event.toolCalls === 0
                ? "Direct answer synthesis selected"
                : `Model planned ${event.toolCalls} tool execution${event.toolCalls === 1 ? "" : "s"}`,
            ),
          );
        } else if (event.phase === "loading_context") {
          port.appendLog?.(makeLog(AgentRunLogLevel.CTX, "Financial context loaded & grounded"));
        }
        port.updateActivity(key, patch);
      }
      return false;
    }

    case "tool_call":
      port.appendLog?.(makeLog(AgentRunLogLevel.TOOL, `Invoking ${event.tool}...`));
      port.appendActivity({
        tool: event.tool,
        kind: AgentActivityKind.TOOL,
        status: AgentActivityStatus.RUNNING,
      });
      return false;

    case "tool_result":
      port.appendLog?.(
        makeLog(
          AgentRunLogLevel.TOOL,
          `${event.tool} ${event.ok ? "✓" : "✕"}`,
          event.summary ?? (event.ok ? "Completed" : "Error"),
        ),
      );
      port.updateActivity(event.tool, {
        status: event.ok ? AgentActivityStatus.SUCCESS : AgentActivityStatus.ERROR,
        summary: event.summary,
        ...(event.label ? { label: event.label } : {}),
      });
      return false;

    case "confirmation_required":
      port.appendLog?.(
        makeLog(
          AgentRunLogLevel.ACTION,
          `Action proposal: ${event.card.title}`,
          "Awaiting user confirmation",
        ),
      );
      port.updateActivity(event.tool, {
        status: AgentActivityStatus.SUCCESS,
        summary: "Ready for your approval",
      });
      port.appendActivity({
        tool: approvalKey(event.actionId),
        kind: AgentActivityKind.APPROVAL,
        status: AgentActivityStatus.RUNNING,
        label: "Waiting for your approval",
      });
      port.appendConfirmation({
        actionId: event.actionId,
        tool: event.tool,
        card: event.card,
        status: AgentConfirmationStatus.PENDING,
      });
      return false;

    case "action_updated":
      port.appendLog?.(makeLog(AgentRunLogLevel.ACTION, `Updated action: ${event.card.title}`));
      port.resolveApprovalActivity(event.actionId, {
        status: AgentActivityStatus.SUCCESS,
        summary: "Updated in latest message",
      });
      port.appendActivity({
        tool: approvalKey(event.actionId),
        kind: AgentActivityKind.APPROVAL,
        status: AgentActivityStatus.RUNNING,
        label: "Waiting for your approval",
      });
      port.updateConfirmationCard(event.actionId, event.card, event.tool);
      return false;

    case "action_result":
      port.appendLog?.(
        makeLog(
          AgentRunLogLevel.ACTION,
          `Action ${event.ok ? "confirmed & executed" : "rejected/failed"}`,
        ),
      );
      port.updateConfirmationStatus(
        event.actionId,
        event.ok ? AgentConfirmationStatus.EXECUTED : AgentConfirmationStatus.FAILED,
      );
      port.resolveApprovalActivity(event.actionId, {
        status: event.ok ? AgentActivityStatus.SUCCESS : AgentActivityStatus.ERROR,
        summary: event.ok ? "Action completed" : "Action failed",
      });
      return false;

    case "usage":
      port.appendLog?.(
        makeLog(
          AgentRunLogLevel.SYS,
          `Tokens processed: in=${event.tokensIn} out=${event.tokensOut}`,
        ),
      );
      return false;

    case "error":
      port.appendLog?.(makeLog(AgentRunLogLevel.ERR, `Stream error: ${event.error}`));
      port.failStream(event.error);
      return true;

    case "done":
      port.appendLog?.(makeLog(AgentRunLogLevel.DONE, "Agent run finished successfully"));
      port.endStream();
      return true;

    default:
      return false;
  }
}

import type { AgentStreamEvent } from "@fin-ai/ai-engine";
import {
  AgentActivityKind,
  AgentActivityStatus,
  AgentConfirmationStatus,
  AgentMode,
  AgentRunLogLevel,
  AgentStreamEventType,
  ExecutionPhase,
  PhaseStatus,
} from "@fin-ai/shared-types";
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
    case AgentStreamEventType.CONVERSATION:
      port.onConversation(event.conversationId);
      return false;

    case AgentStreamEventType.TITLE:
      port.onTitle?.(event.title);
      return false;

    case AgentStreamEventType.RUN:
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

    case AgentStreamEventType.MODE:
      port.appendLog?.(
        makeLog(
          AgentRunLogLevel.SYS,
          event.mode === AgentMode.AGENT
            ? "Agent mode — tools & actions enabled"
            : "Advisor mode — conversational fast reply",
        ),
      );
      port.onMode?.(event.mode);
      return false;

    case AgentStreamEventType.LOG:
      port.appendLog?.(makeLog(event.level, event.message, event.detail));
      return false;

    case AgentStreamEventType.TOKEN:
      port.appendText(event.content);
      return false;

    case AgentStreamEventType.REASONING:
      port.appendReasoning?.(event.content);
      return false;

    case AgentStreamEventType.TOKEN_REPLACE:
      port.replaceText(event.content);
      port.appendLog?.(
        makeLog(AgentRunLogLevel.STREAM, "Grounded response replaced pre-action tokens"),
      );
      return false;

    case AgentStreamEventType.PHASE: {
      const key = phaseKey(event.phase, event.turn, event.pendingAction);
      if (event.status === PhaseStatus.START) {
        if (event.phase === ExecutionPhase.LOADING_CONTEXT) {
          port.updateActivity("phase:agent_started", { status: AgentActivityStatus.SUCCESS });
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
        }
        port.updateActivity(key, patch);
      }
      return false;
    }

    case AgentStreamEventType.TOOL_CALL:
      port.appendLog?.(makeLog(AgentRunLogLevel.TOOL, `Invoking ${event.tool}...`));
      port.appendActivity({
        tool: event.tool,
        kind: AgentActivityKind.TOOL,
        status: AgentActivityStatus.RUNNING,
      });
      return false;

    case AgentStreamEventType.TOOL_RESULT:
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

    case AgentStreamEventType.CONFIRMATION_REQUIRED:
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

    case AgentStreamEventType.ACTION_UPDATED:
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

    case AgentStreamEventType.ACTION_RESULT:
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

    case AgentStreamEventType.USAGE:
      port.appendLog?.(
        makeLog(
          AgentRunLogLevel.SYS,
          `Tokens processed: in=${event.tokensIn} out=${event.tokensOut}`,
        ),
      );
      return false;

    case AgentStreamEventType.ERROR:
      port.appendLog?.(makeLog(AgentRunLogLevel.ERR, `Stream error: ${event.error}`));
      port.failStream(event.error);
      return true;

    case AgentStreamEventType.DONE:
      port.appendLog?.(makeLog(AgentRunLogLevel.DONE, "Agent run finished successfully"));
      port.endStream();
      return true;

    default:
      return false;
  }
}

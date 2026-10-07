import { Logger } from "@yuva-devlab/logger";
import type { AgentCard, LlmToolCall } from "@finai/ai-engine";
import type { AgentEventEmitter } from "../agent.types";
import type { AuditService } from "../audit.service";

interface SpecialActionContext {
  userId: string;
  runId: string;
}

export interface SpecialActionResult {
  handled: boolean;
  result?: Record<string, unknown>;
}

/**
 * Handles agent-specific composite tools like action.patch and action.confirm.
 * Extracted from AgentToolDispatcher to respect line count bounds.
 */
export async function handleSpecialAction(
  call: LlmToolCall,
  output: unknown,
  ctx: SpecialActionContext,
  emit: AgentEventEmitter,
  auditService: AuditService,
  logger: Logger,
): Promise<SpecialActionResult> {
  if (call.name === "action.patch" && (output as { card?: unknown }).card) {
    const patchOutput = output as {
      ok: boolean;
      actionId: string;
      tool: string;
      card: AgentCard;
      error?: string;
    };
    if (patchOutput.ok && patchOutput.card) {
      logger.info(`[special-action] Patched action ${patchOutput.actionId}`);
      emit({
        type: "action_updated",
        actionId: patchOutput.actionId,
        tool: patchOutput.tool,
        card: patchOutput.card,
      });
      await auditService.record({
        userId: ctx.userId,
        runId: ctx.runId,
        action: "action.patch",
        tool: patchOutput.tool,
        status: "success",
      });
      return {
        handled: true,
        result: {
          ok: true,
          status: "action_updated",
          actionId: patchOutput.actionId,
          message: "The pending action has been updated. Show the updated confirmation card.",
        },
      };
    }
    logger.warn(`[special-action] Action patch failed: ${patchOutput.error}`);
    emit({
      type: "tool_result",
      tool: call.name,
      ok: false,
      summary: patchOutput.error || "Failed to patch the pending action",
    });
    return { handled: true, result: { ok: false, error: patchOutput.error || "Failed to patch" } };
  }

  if (call.name === "action.confirm" && (output as { actionId?: string }).actionId) {
    const confirmOutput = output as {
      ok: boolean;
      actionId: string;
      tool: string;
      error?: string;
    };
    if (confirmOutput.ok) {
      logger.info(`[special-action] Confirmed action ${confirmOutput.actionId}`);
      emit({ type: "action_result", actionId: confirmOutput.actionId, ok: true });
      await auditService.record({
        userId: ctx.userId,
        runId: ctx.runId,
        action: "action.confirm",
        tool: confirmOutput.tool,
        status: "success",
      });
      return {
        handled: true,
        result: {
          ok: true,
          status: "action_executed",
          actionId: confirmOutput.actionId,
          message: "The action has been confirmed and executed.",
        },
      };
    }
    logger.warn(`[special-action] Action confirm failed: ${confirmOutput.error}`);
    emit({ type: "action_result", actionId: confirmOutput.actionId, ok: false });
    return {
      handled: true,
      result: { ok: false, error: confirmOutput.error || "Failed to confirm" },
    };
  }

  return { handled: false };
}

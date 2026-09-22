import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import type { LlmToolCall } from "@finai/ai-engine";
import { ToolRegistry } from "../tool-registry";
import { AgentActionService } from "../action.service";
import { AuditService } from "../audit.service";
import { EntityMemoryService } from "../entity-memory";
import { extractEntitiesFromInput, extractEntitiesFromOutput } from "../entity-extractor";
import type { AgentContext, AgentEventEmitter } from "../agent.types";

/**
 * Validates and executes a single tool call surfaced by the model.
 *
 * This is the safety choke-point between the LLM and user data:
 *  1. Tool must exist in the registry.
 *  2. Arguments are Zod-validated — malformed model output never reaches a service.
 *  3. Referenced entities are recorded into conversation entity memory.
 *  4. Confirmation-required tools do NOT execute — a proposal is stored and
 *     a confirmation card is emitted.
 *  5. Read tools execute immediately; failures are caught and surfaced to the model.
 */
@Injectable()
export class AgentToolDispatcher {
  private readonly logger = new Logger(AgentToolDispatcher.name);

  constructor(
    private readonly registry: ToolRegistry,
    @Inject(forwardRef(() => AgentActionService))
    private readonly actionService: AgentActionService,
    private readonly auditService: AuditService,
    private readonly entityMemory: EntityMemoryService,
  ) {}

  async dispatch(
    call: LlmToolCall,
    ctx: AgentContext,
    emit: AgentEventEmitter,
  ): Promise<Record<string, unknown>> {
    emit({ type: "tool_call", tool: call.name, runId: ctx.runId });

    const tool = this.registry.get(call.name);
    if (!tool) {
      this.logger.warn(
        `Unknown tool requested by model: "${call.name}" (runId: ${ctx.runId.slice(0, 8)})`,
      );
      await this.auditService.record({
        userId: ctx.userId,
        runId: ctx.runId,
        action: "tool.execute",
        tool: call.name,
        status: "error",
        metadata: { reason: "unknown_tool" },
      });
      emit({ type: "tool_result", tool: call.name, ok: false, summary: "Unknown tool" });
      return { ok: false, error: `Unknown tool: ${call.name}` };
    }

    let parsed: unknown;
    try {
      parsed = tool.schema.parse(JSON.parse(call.arguments || "{}"));
    } catch {
      this.logger.warn(
        `Tool "${call.name}" received invalid arguments from model: ${call.arguments?.slice(0, 120)}`,
      );
      emit({
        type: "tool_result",
        tool: call.name,
        ok: false,
        summary: "The agent supplied invalid arguments for this step",
        label: tool.label,
      });
      return {
        ok: false,
        error: `Invalid arguments for ${call.name}. Provide a JSON object matching the tool schema.`,
      };
    }

    try {
      await this.entityMemory.record(
        ctx.conversationId,
        extractEntitiesFromInput(call.name, parsed as Record<string, unknown>),
      );

      if (tool.confirmation === "required") {
        const warnings: { field: string; message: string }[] = tool.validate
          ? await tool.validate(parsed, { userId: ctx.userId }).catch(() => [])
          : [];

        const resolvedInput = tool.resolveInput
          ? await tool.resolveInput(parsed, { userId: ctx.userId })
          : parsed;

        const proposal = await this.actionService.propose({
          userId: ctx.userId,
          conversationId: ctx.conversationId,
          tool: tool.name,
          input: resolvedInput,
          runId: ctx.runId,
        });

        this.logger.log(
          `Tool "${call.name}" proposed (actionId: ${proposal.id}, warnings: ${warnings.length}, runId: ${ctx.runId.slice(0, 8)})`,
        );
        emit({
          type: "confirmation_required",
          actionId: proposal.id,
          tool: tool.name,
          card: await this.actionService.buildConfirmationCard(
            tool.name,
            resolvedInput,
            ctx.userId,
            warnings,
          ),
        });

        await this.auditService.record({
          userId: ctx.userId,
          runId: ctx.runId,
          action: "tool.propose",
          tool: tool.name,
          status: "proposed",
          metadata: { actionId: proposal.id, warnings: warnings.length },
        });

        const warningBlock =
          warnings.length > 0
            ? ` Validation warnings: ${warnings.map((w) => `${w.field}: ${w.message}`).join("; ")}.`
            : "";

        return {
          ok: true,
          status: "awaiting_confirmation",
          actionId: proposal.id,
          message:
            "The action was proposed and is waiting for the user to confirm. Its result will arrive after confirmation." +
            warningBlock,
        };
      }

      const output = await tool.execute(parsed, ctx);
      await this.entityMemory.record(
        ctx.conversationId,
        extractEntitiesFromOutput(call.name, tool.serialize(output)),
      );

      // Special handling for action.patch
      if (call.name === "action.patch" && (output as { card?: unknown }).card) {
        const patchOutput = output as {
          ok: boolean;
          actionId: string;
          tool: string;
          card: import("@finai/ai-engine").AgentCard;
          error?: string;
        };
        if (patchOutput.ok && patchOutput.card) {
          emit({
            type: "action_updated",
            actionId: patchOutput.actionId,
            tool: patchOutput.tool,
            card: patchOutput.card,
          });
          await this.auditService.record({
            userId: ctx.userId,
            runId: ctx.runId,
            action: "action.patch",
            tool: patchOutput.tool,
            status: "success",
          });
          return {
            ok: true,
            status: "action_updated",
            actionId: patchOutput.actionId,
            message: "The pending action has been updated. Show the updated confirmation card.",
          };
        }
        emit({
          type: "tool_result",
          tool: call.name,
          ok: false,
          summary: patchOutput.error || "Failed to patch the pending action",
          label: tool.label,
        });
        return { ok: false, error: patchOutput.error || "Failed to patch" };
      }

      // Special handling for action.confirm
      if (call.name === "action.confirm" && (output as { actionId?: string }).actionId) {
        const confirmOutput = output as {
          ok: boolean;
          actionId: string;
          tool: string;
          error?: string;
        };
        if (confirmOutput.ok) {
          emit({ type: "action_result", actionId: confirmOutput.actionId, ok: true });
          await this.auditService.record({
            userId: ctx.userId,
            runId: ctx.runId,
            action: "action.confirm",
            tool: confirmOutput.tool,
            status: "success",
          });
          return {
            ok: true,
            status: "action_executed",
            actionId: confirmOutput.actionId,
            message: "The action has been confirmed and executed.",
          };
        }
        emit({ type: "action_result", actionId: confirmOutput.actionId, ok: false });
        return { ok: false, error: confirmOutput.error || "Failed to confirm" };
      }

      this.logger.log(
        `Tool "${call.name}" executed successfully (runId: ${ctx.runId.slice(0, 8)})`,
      );
      emit({
        type: "tool_result",
        tool: call.name,
        ok: true,
        summary: tool.summarize(output),
        label: tool.label,
      });
      await this.auditService.record({
        userId: ctx.userId,
        runId: ctx.runId,
        action: "tool.execute",
        tool: tool.name,
        status: "success",
      });
      return { ok: true, data: tool.serialize(output) };
    } catch (error) {
      const message = (error as Error).message || "Tool execution failed";
      this.logger.error(`Tool "${call.name}" failed (runId: ${ctx.runId.slice(0, 8)}): ${message}`);
      emit({
        type: "tool_result",
        tool: call.name,
        ok: false,
        summary: message,
        label: tool.label,
      });
      await this.auditService.record({
        userId: ctx.userId,
        runId: ctx.runId,
        action: "tool.execute",
        tool: tool.name,
        status: "error",
        metadata: { error: message },
      });
      return { ok: false, error: message };
    }
  }
}

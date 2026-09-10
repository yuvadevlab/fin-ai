import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { AgentActionService } from "../action.service";
import type { ActionManager } from "../action-manager";

/**
 * Tools for managing pending (PROPOSED) agent actions through conversation.
 *
 * These tools enable the conversational confirmation editing model:
 * - `action.patch`: Apply a field-level correction to a pending action. Merges
 *   the supplied fields into the existing input, revalidates, and returns an
 *   updated confirmation card. Does NOT execute the action.
 * - `action.confirm`: Confirm and execute a pending action by name. Allows the
 *   user to confirm through natural language ("confirm", "yes", "go ahead").
 *
 * Both tools operate on the most recent PROPOSED action in the conversation.
 * The agent is prompted to use these when a pending action exists and the user's
 * message is a correction or confirmation.
 */
export function createActionManagementTools(
  actionManager: ActionManager,
  actionService: AgentActionService,
) {
  return [
    defineTool({
      name: "action.patch",
      description:
        "Apply a correction to the pending (unconfirmed) action. Use when the user wants to change a field (amount, date, account, category, etc.) of the action currently awaiting confirmation. Only include the fields that should change — all other fields are preserved. The action remains pending after patching; it is NOT executed. Returns an updated confirmation card. If the reference is ambiguous (e.g. 'use SBI' but the user has two SBI accounts), ask for clarification instead of patching.",
      access: "write",
      confirmation: "none",
      schema: z.object({
        // The fields to patch into the existing action input. For transactions:
        // amount, type, account, accountId, category, categoryId, toAccount,
        // toAccountId, date, dateExpression, notes. Only include changed fields.
        patch: z.record(z.string(), z.any()),
      }),
      execute: async (input, ctx) => {
        // Find the pending action for this conversation
        const pending = await actionManager.getPendingAction(ctx.conversationId, ctx.userId);
        if (!pending) {
          return {
            ok: false,
            error: "No pending action to patch. Propose a new action instead.",
          };
        }

        try {
          const result = await actionManager.patchAction(pending.id, ctx.userId, input.patch);
          return {
            ok: true,
            actionId: result.action.id,
            tool: result.action.tool,
            card: result.card,
            message: "The pending action has been updated. Show the updated confirmation card.",
          };
        } catch (error) {
          return {
            ok: false,
            error: (error as Error).message || "Failed to patch the pending action",
          };
        }
      },
      serialize: (output) => output,
      summarize: () => "Updated the pending action",
    }),
    defineTool({
      name: "action.confirm",
      description:
        "Confirm and execute the pending (unconfirmed) action. Use when the user explicitly confirms ('confirm', 'yes', 'go ahead', 'looks good') the action currently awaiting confirmation. This executes the action and returns the result.",
      access: "write",
      confirmation: "none",
      schema: z.object({}),
      execute: async (input, ctx) => {
        // Find the pending action for this conversation
        const pending = await actionManager.getPendingAction(ctx.conversationId, ctx.userId);
        if (!pending) {
          return {
            ok: false,
            error: "No pending action to confirm.",
          };
        }

        try {
          const result = await actionService.confirm(pending.id, ctx.userId);
          return {
            ok: true,
            actionId: pending.id,
            tool: pending.tool,
            alreadyExecuted: result.alreadyExecuted,
            result: result.result,
            message: "The action has been confirmed and executed.",
          };
        } catch (error) {
          return {
            ok: false,
            error: (error as Error).message || "Failed to confirm the action",
          };
        }
      },
      serialize: (output) => output,
      summarize: () => "Confirmed and executed the pending action",
    }),
  ];
}

/**
 * Builds the pending-action context section injected into the system prompt.
 *
 * Tells the LLM that there is an unconfirmed action and instructs it to:
 *  - Call `action.patch` with only changed fields on corrections.
 *  - Call `action.confirm` on explicit user confirmation.
 *  - Ignore the pending action for unrelated messages.
 */
export function buildPendingActionSection(actionId: string, tool: string, input: unknown): string {
  return [
    "## PENDING ACTION (awaiting the user's confirmation)",
    "",
    `There is an unconfirmed action the user is reviewing. Their next message may be a correction to it.`,
    "",
    `- Action ID: ${actionId}`,
    `- Tool: ${tool}`,
    `- Current input: ${JSON.stringify(input)}`,
    "",
    "If the user's message corrects or modifies this action (e.g. 'change the date to Sep 6', 'use HDFC instead', 'make it ₹550'), call `action.patch` with ONLY the fields that should change. Do NOT include unchanged fields. The action remains pending after patching — it is NOT executed.",
    "",
    "If the user explicitly confirms the action (e.g. 'confirm', 'yes', 'go ahead', 'looks good'), call `action.confirm` to execute it.",
    "",
    "If the user's message is an unrelated new request, ignore this pending action and process the message normally. The pending action will remain available for later confirmation.",
    "",
    "IMPORTANT: A conversational edit (action.patch) must NOT execute the action. Only action.confirm or the user clicking the confirm button executes it.",
  ].join("\n");
}

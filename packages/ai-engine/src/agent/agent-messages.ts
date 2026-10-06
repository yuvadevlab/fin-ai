/**
 * Standard agent user-facing messages and templates.
 * Centralized in @finai/ai-engine so that prompt and agent response contracts
 * remain consistent across the monorepo without inline prompt strings in API services.
 */

/**
 * Message emitted when write action(s) have been proposed and are awaiting user confirmation.
 */
export function formatActionProposalMessage(count: number): string {
  if (count > 1) {
    return `I've proposed ${count} actions for your confirmation. Please review the details on the cards and confirm or reject.`;
  }
  return "I've proposed an action for your confirmation. Please review the details on the card and confirm or reject.";
}

/**
 * Fallback message when the model claimed confirmation cards exist but no proposals were actually created.
 */
export const AGENT_PROPOSAL_FAILED_MESSAGE =
  "I could not complete preparing the requested actions. Please check the details and try again.";

/**
 * Message emitted when the ReAct loop exceeds MAX_ITERATIONS.
 */
export const AGENT_MAX_ITERATIONS_MESSAGE =
  "The agent used too many steps for this request. Try narrowing the question.";

/**
 * Message returned to model when tool arguments fail validation.
 */
export function formatToolInvalidArgumentMessage(toolName: string, details?: string): string {
  if (details) {
    return `Invalid arguments for ${toolName}: ${details}`;
  }
  return `Invalid arguments for ${toolName}. Provide a JSON object matching the tool schema.`;
}

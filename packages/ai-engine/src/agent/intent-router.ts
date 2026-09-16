/**
 * Fast-path intent router for the FinAI agent.
 *
 * FAIL-OPEN ROUTING: decides which runtime answers each user message. Only
 * confidently conversational messages (greetings, definition/advice questions
 * that do not reference financial entities) take the cheap tool-free LLM
 * fast-path; every unclassifiable or action-looking message routes to the
 * tool-enabled agent loop.
 *
 * This flips the historical approach (route to agent only when a keyword
 * matched) so a router miss can never silently disable write/action
 * capabilities — the failure mode that let "Today Doctor consultation
 * (Maternity) 400" fall through to a chat-only model that claimed it couldn't
 * write. Users can also force the agent loop manually via the UI toggle.
 */

import { FINAI_CORE_PERSONA } from "../persona";

export interface IntentAnalysisParams {
  question: string;
  hasPendingAction?: boolean;
  hasRecentToolCalls?: boolean;
}

/**
 * Evaluates whether an incoming user message requires agent tools.
 *
 * Returns `false` ONLY for clearly conversational turns (greetings and
 * question-phrased advice that reference no financial entities); returns
 * `true` for everything else — this router FAILS OPEN so a missed pattern can
 * never strand an action request in the tool-free path. When in doubt, the
 * message goes to the agent loop (which also answers plain advice), and the
 * user's manual Agent-mode toggle remains the final escape hatch.
 */
export function requiresAgentTools(_params: IntentAnalysisParams): boolean {
  // Always route to the tool-enabled agent loop so that the LLM has tools available
  // whenever needed, and can answer conversationally when no tools are required.
  return true;
}

export interface ToolFreePromptOptions {
  currentDate: string;
  portfolioSnapshot?: string;
}

/**
 * Assembles a lightweight prompt for tool-free conversational turns.
 * Omit tool plan directives and JSON schemas to keep payload small and fast.
 */
export function buildToolFreeAgentPrompt(options: ToolFreePromptOptions): string {
  const parts = [
    FINAI_CORE_PERSONA,
    "",
    "CONVERSATIONAL ADVISOR MODE:",
    "- Answer the user's financial question directly, accurately, and empathetically.",
    "- For definitions, budgeting concepts, investment principles (e.g., SIP, compound interest, emergency funds), provide clear explanations with examples in Indian Rupees (₹).",
    "- If the user asks to create, update, or inspect their private accounts or records, let them know you can do that if they specify the details.",
    `- CURRENT DATE: ${options.currentDate}`,
  ];

  if (options.portfolioSnapshot) {
    parts.push(
      "",
      "USER'S FINANCIAL SNAPSHOT (for reference):",
      "```text",
      options.portfolioSnapshot,
      "```",
    );
  }

  return parts.join("\n");
}

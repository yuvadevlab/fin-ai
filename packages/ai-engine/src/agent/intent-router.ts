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

/** Actionable keywords indicating mutations or database write operations. */
const ACTION_VERBS =
  /\b(add|create|record|spent|spend|pay|paid|buy|bought|transfer|deposit|withdraw|delete|remove|update|change|edit|rename|set|recategorize|cancel)\b/i;

/** Patterns indicating queries against private financial accounts or entities. */
const USER_ENTITY_QUERIES =
  /\b(my\s+(accounts?|balance|spending|spend|budgets?|goals?|transactions?|investments?|portfolio|net\s*worth|loans?|emi|debt|savings|funds?|emergency\s+fund|mutual\s+funds?|fixed\s*deposits?|fds?|credit\s*card|stocks?)|how\s+much\s+(did\s+i|do\s+i\s+have|have\s+i)|where\s+did\s+my\s+money\s+go|recent\s+transactions?|last\s+transaction|list\s+(accounts?|budgets?|categories|goals?|investments?)|breakdown\s+of\s+my|statement|what\s+did\s+i\s+(spend|spends|paid|pay|buy)|did\s+i\s+(spend|spends|paid|pay|buy))\b/i;

/** Currency references paired with numerical amounts (e.g. "₹500 for lunch", "spent 200 rs"). */
const CURRENCY_AMOUNT = /(₹|rs\.?|inr)\s*\d+|\d+\s*(₹|rs\.?|rupees|inr)/i;

/** Expense/budget entity nouns (plural-aware) completing action/query requests. */
const ENTITY_NOUNS =
  /\b(budgets?|goals?|categor(y|ies)|accounts?|transactions?|expenses?|income)\b/i;

/**
 * Interrogative phrasing — conversational questions ("what is", "explain",
 * "should I"). Questions may still route to the agent when they explicitly
 * mention entities or use action verbs (checked above).
 */
const QUESTION_MARKER =
  /\?|^\s*(what|why|how|when|where|who|which|whose|can|could|should|would|will|shall|is|are|am|was|were|do|does|did|may|might|tell|explain|compare|define|describe|difference|help)\b/i;

/** User-initiated greetings / farewells — never actionable. */
const GREETING =
  /^\s*(hi|hello|hey|yo|howdy|hiya|thanks|thank\s*you|good\s*(morning|afternoon|evening)|namaste|bye|goodbye)\b/i;

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
export function requiresAgentTools(params: IntentAnalysisParams): boolean {
  if (params.hasPendingAction) return true;
  if (params.hasRecentToolCalls) return true;

  const q = params.question.trim();
  if (!q) return false;

  // Explicit high-confidence routes — these PROVE the agent loop is needed.
  if (USER_ENTITY_QUERIES.test(q)) return true;
  if (ACTION_VERBS.test(q) && (CURRENCY_AMOUNT.test(q) || ENTITY_NOUNS.test(q))) return true;

  // Fails open: conversational turns (with no entity references) are the only
  // ones allowed on the tool-free fast path.
  const conversational = QUESTION_MARKER.test(q) || GREETING.test(q);
  const mentionsEntity = ENTITY_NOUNS.test(q);

  return !(conversational && !mentionsEntity);
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

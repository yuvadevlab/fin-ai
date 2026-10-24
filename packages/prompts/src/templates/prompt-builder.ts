import {
  ADVISOR_SYSTEM_PROMPT_TEMPLATE,
  INSIGHT_SYSTEM_PROMPT_TEMPLATE,
  PAGE_INSIGHT_PROMPTS,
  TITLE_GENERATION_PROMPT_TEMPLATE,
  InsightPage,
} from "../system/advisor-system.prompt";

/**
 * Builds the comprehensive system prompt for the conversational AI Advisor chat.
 */
export function buildAdvisorSystemPrompt(context: string): string {
  return ADVISOR_SYSTEM_PROMPT_TEMPLATE.replace("{context}", context);
}

/**
 * Builds the focused system prompt for short page-level micro-insights.
 */
export function buildInsightSystemPrompt(context: string): string {
  return INSIGHT_SYSTEM_PROMPT_TEMPLATE.replace("{context}", context);
}

/**
 * Resolves the user prompt for a specific dashboard page insight.
 */
export function buildPageInsightUserPrompt(page: string): string {
  const validKey = (page in PAGE_INSIGHT_PROMPTS ? page : "dashboard") as InsightPage;
  return PAGE_INSIGHT_PROMPTS[validKey];
}

/**
 * Formats the user prompt for AI-driven category emoji suggestion requests.
 */
export function buildEmojiSuggestionUserPrompt(categoryName: string): string {
  return `Category name: ${categoryName}\nSuggested emoji:`;
}

/**
 * Formats the user prompt for title generation requests.
 */
export function buildTitleGenerationUserPrompt(question: string): string {
  return TITLE_GENERATION_PROMPT_TEMPLATE.replace("{question}", question);
}

export const buildTitleGenerationPrompt = buildTitleGenerationUserPrompt;

/**
 * Cleans, validates, and normalizes an AI-generated conversation title.
 */
export function sanitizeConversationTitle(
  raw: string | undefined | null,
  fallback: string,
): string {
  if (!raw) return fallback.slice(0, 50).trim();

  let cleaned = raw
    .replace(/^(title|topic):\s*/i, "")
    .replace(/^["'`\s]+|["'`\s]+$/g, "")
    .replace(/[\r\n].*/g, "")
    .trim();

  if (!cleaned || cleaned.length < 2) {
    return fallback.slice(0, 50).trim();
  }

  if (cleaned.length > 60) {
    cleaned = cleaned.slice(0, 57).trim() + "...";
  }

  return cleaned;
}

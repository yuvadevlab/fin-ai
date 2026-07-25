import {
  ADVISOR_SYSTEM_PROMPT_TEMPLATE,
  INSIGHT_SYSTEM_PROMPT_TEMPLATE,
  PAGE_INSIGHT_PROMPTS,
  InsightPage,
} from "./prompts.config";

/** Builds the system prompt for the interactive AI Advisor chat */
export function buildAdvisorSystemPrompt(context: string): string {
  return ADVISOR_SYSTEM_PROMPT_TEMPLATE.replace("{context}", context);
}

/** Builds the system prompt for short page-level micro-insights */
export function buildInsightSystemPrompt(context: string): string {
  return INSIGHT_SYSTEM_PROMPT_TEMPLATE.replace("{context}", context);
}

/** Resolves the user prompt for a specific page insight */
export function buildPageInsightUserPrompt(page: string): string {
  const validKey = (page in PAGE_INSIGHT_PROMPTS ? page : "dashboard") as InsightPage;
  return PAGE_INSIGHT_PROMPTS[validKey];
}

/** Formats the user prompt for emoji suggestion requests */
export function buildEmojiSuggestionUserPrompt(categoryName: string): string {
  return `Category name: ${categoryName}\nSuggested emoji:`;
}

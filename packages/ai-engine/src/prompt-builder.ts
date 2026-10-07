/**
 * @file packages/ai-engine/src/prompt-builder.ts
 * @description Dynamic prompt assembly utilities for the FinAI LLM engine.
 * Generates tailored system prompts, page micro-insights, and thread title summaries.
 * @module @finai/ai-engine/prompt-builder
 */

import {
  ADVISOR_SYSTEM_PROMPT_TEMPLATE,
  INSIGHT_SYSTEM_PROMPT_TEMPLATE,
  PAGE_INSIGHT_PROMPTS,
  TITLE_GENERATION_PROMPT_TEMPLATE,
  InsightPage,
} from "./prompts.config";

/**
 * Builds the comprehensive system prompt for the conversational AI Advisor chat.
 *
 * @param context - Formatted text snapshot of user accounts, transactions, and budgets.
 * @returns Ready-to-use LLM system prompt string.
 */
export function buildAdvisorSystemPrompt(context: string): string {
  // Substitute user portfolio context snapshot into master template
  return ADVISOR_SYSTEM_PROMPT_TEMPLATE.replace("{context}", context);
}

/**
 * Builds the focused system prompt for short page-level micro-insights.
 *
 * @param context - Page-specific financial summary context string.
 * @returns Ready-to-use LLM system prompt string.
 */
export function buildInsightSystemPrompt(context: string): string {
  // Substitute page context into micro-insight system prompt template
  return INSIGHT_SYSTEM_PROMPT_TEMPLATE.replace("{context}", context);
}

/**
 * Resolves the user prompt for a specific dashboard page insight.
 * Gracefully defaults to "dashboard" if an unrecognized page slug is supplied.
 *
 * @param page - Target page identifier (e.g. 'transactions', 'budgets', 'investments').
 * @returns Specialized insight user prompt.
 */
export function buildPageInsightUserPrompt(page: string): string {
  // Fall back to dashboard if a newly introduced page does not yet have a specialized prompt
  const validKey = (page in PAGE_INSIGHT_PROMPTS ? page : "dashboard") as InsightPage;
  return PAGE_INSIGHT_PROMPTS[validKey];
}

/**
 * Formats the user prompt for AI-driven category emoji suggestion requests.
 *
 * @param categoryName - The human-entered name of the spending category.
 * @returns Clean prompt asking the model for a single emoji symbol.
 */
export function buildEmojiSuggestionUserPrompt(categoryName: string): string {
  return `Category name: ${categoryName}\nSuggested emoji:`;
}

/**
 * Builds the prompt instructing the fast model to generate a 3-6 word summary title.
 *
 * @param question - The initial user prompt starting the conversation thread.
 * @returns Fast completion prompt string.
 */
export function buildTitleGenerationPrompt(question: string): string {
  // Replace question placeholder with initial user inquiry
  return TITLE_GENERATION_PROMPT_TEMPLATE.replace("{question}", question);
}

/**
 * Cleans, validates, and normalizes an AI-generated conversation title.
 * Strips conversational filler, prefixes (e.g., 'Title:'), quotes, and enforces length bounds.
 *
 * @param raw - The raw text output produced by the LLM completion.
 * @param fallback - Safe fallback string (typically sliced from the original user inquiry).
 * @returns Normalized 3-6 word title string (max 60 characters).
 */
export function sanitizeConversationTitle(
  raw: string | undefined | null,
  fallback: string,
): string {
  // Fall back immediately if raw generation is null or empty
  if (!raw) return fallback.slice(0, 50).trim();

  // 1. Strip common LLM artifact prefixes, markdown backticks, and enclosing quotes
  let cleaned = raw
    .replace(/^(title|topic):\s*/i, "")
    .replace(/^["'`\s]+|["'`\s]+$/g, "")
    .replace(/[\r\n].*/g, "")
    .trim();

  // 2. Enforce minimum character threshold
  if (!cleaned || cleaned.length < 2) {
    return fallback.slice(0, 50).trim();
  }

  // 3. Enforce maximum character boundary for responsive UI displays
  if (cleaned.length > 60) {
    cleaned = cleaned.slice(0, 57).trim() + "...";
  }

  return cleaned;
}

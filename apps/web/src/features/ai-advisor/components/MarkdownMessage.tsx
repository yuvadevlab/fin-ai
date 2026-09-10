"use client";

import { MarkdownContent } from "@finai/ui";

interface MarkdownMessageProps {
  content: string;
}

/**
 * Renders rich markdown from the AI response using FinAI design-token classes.
 *
 * Now a thin wrapper around the generic `MarkdownContent` from `@finai/ui`.
 * Strips trailing follow-up suggestions (rendered separately as interactive
 * chips by the caller) and supports streaming by rendering partial markdown
 * incrementally — no buffering.
 */
export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return <MarkdownContent content={content} stripSuggestions={true} />;
}

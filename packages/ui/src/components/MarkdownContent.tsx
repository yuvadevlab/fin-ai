import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../lib/utils";
import { normalizeMarkdownMath } from "../lib/markdown-math.utils";

export interface MarkdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  /**
   * When true, strips a trailing "### Follow-up Suggestions" (or similar)
   * section from the rendered output. Callers that render follow-ups as
   * separate interactive chips should enable this to avoid duplicate content.
   * @default false
   */
  stripSuggestions?: boolean;
}

/**
 * Generic Markdown renderer using FinAI design-token classes.
 *
 * Supports GFM tables, callouts, lists, headers, code snippets, inline
 * highlights, and LaTeX math notation normalization. Renders partial/incomplete
 * Markdown incrementally during streaming — no buffering is applied.
 *
 * Extracted from the AI Advisor's `MarkdownMessage` so any feature can render
 * LLM-generated or user-authored Markdown with the shared styling.
 */
export function MarkdownContent({
  content,
  stripSuggestions = false,
  className,
  ...props
}: MarkdownContentProps) {
  // Strip a trailing follow-up suggestions section when requested.
  const baseContent = stripSuggestions
    ? content
        .split(
          /###\s*(?:Follow-?[uU]p|Suggested|Recommended)\s*(?:Suggestions|Questions|Next Steps|Follow-ups)?[:\s]*/i,
        )[0]
        .trim()
    : content;

  const renderContent = normalizeMarkdownMath(baseContent);

  return (
    <div className={cn("fn-chat-prose", className)} {...props}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="fn-chat-prose-table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {renderContent || content}
      </ReactMarkdown>
    </div>
  );
}

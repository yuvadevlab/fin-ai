import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}

/**
 * Renders rich markdown from the AI response using FinAI design-token classes.
 * Supports GFM tables, callouts, lists, headers, code snippets, and inline highlights.
 */
export function MarkdownMessage({ content }: MarkdownMessageProps) {
  // Separate content from follow-up suggestions section if present
  const mainContent = content
    .split(
      /###\s*(?:Follow-?[uU]p|Suggested|Recommended)\s*(?:Suggestions|Questions|Next Steps|Follow-ups)?[:\s]*/i,
    )[0]
    .trim();

  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="text-foreground font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic opacity-90">{children}</em>,
          h1: ({ children }) => (
            <h1 className="border-border/40 mt-3 mb-2 border-b pb-1 text-base font-bold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-3 mb-1.5 text-sm font-bold tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-muted-foreground mt-2 mb-1 text-xs font-bold tracking-wider uppercase">
              {children}
            </h3>
          ),
          code: ({ children }) => (
            <code className="bg-muted text-primary rounded px-1.5 py-0.5 font-mono text-xs font-medium">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-primary/60 bg-primary/5 my-2.5 rounded-r-lg border-l-3 py-2 pr-3 pl-3.5 text-xs italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="bg-card/70 ring-border/60 my-3 overflow-x-auto rounded-xl shadow-sm ring-1">
              <table className="w-full border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-secondary/80 text-muted-foreground border-border/60 border-b font-semibold">
              {children}
            </thead>
          ),
          tr: ({ children }) => <tr className="hover:bg-secondary/30 transition">{children}</tr>,
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 text-[11px] font-semibold tracking-wide uppercase">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-border/40 border-b px-3.5 py-2 font-medium">{children}</td>
          ),
        }}
      >
        {mainContent || content}
      </ReactMarkdown>
    </div>
  );
}

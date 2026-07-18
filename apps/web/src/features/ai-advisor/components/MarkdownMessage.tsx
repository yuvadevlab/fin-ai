import ReactMarkdown from "react-markdown";

/**
 * Renders markdown from the AI response using design-token classes
 * instead of @tailwindcss/typography (which isn't installed).
 */
export function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => <h1 className="mb-2 text-base font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-1.5 text-sm font-bold">{children}</h2>,
        h3: ({ children }) => (
          <h3 className="mb-1 text-xs font-bold tracking-wide uppercase">{children}</h3>
        ),
        code: ({ children }) => (
          <code className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-xs">
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-primary/40 border-l-2 pl-3 italic opacity-80">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

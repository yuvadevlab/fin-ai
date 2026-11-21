import React from "react";
import Link from "next/link";
import type { BlogPost } from "../../data/blog-posts.types";
import { ArticleTakeaways } from "./ArticleTakeaways";

export interface ArticleBodyProps {
  post: BlogPost;
}

/**
 * Parses markdown-style links [text](href) in paragraphs into Next.js Link components.
 * Drives contextual in-content PageRank and internal link equity.
 */
function renderParagraphWithLinks(text: string): React.ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    elements.push(
      <Link key={`${match.index}-${href}`} href={href} className="fn-mkt-article-inline-link">
        {label}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}

export function ArticleBody({ post }: ArticleBodyProps): React.JSX.Element {
  return (
    <section className="fn-mkt-section fn-mkt-article-body-section">
      <div className="fn-mkt-container fn-mkt-article-wrap">
        <article>
          <ArticleTakeaways takeaways={post.keyTakeaways} />

          <div className="fn-mkt-article-content">
            {post.sections.map((section) => (
              <section key={section.heading} className="fn-mkt-article-section">
                <h2 className="fn-mkt-article-h2">{section.heading}</h2>
                {section.paragraphs.map((p, idx) => (
                  <p key={idx} className="fn-mkt-article-p">
                    {renderParagraphWithLinks(p)}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

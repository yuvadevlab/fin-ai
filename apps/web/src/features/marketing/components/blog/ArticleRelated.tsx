import React from "react";
import type { BlogPost } from "../../data/blog-posts.types";
import { BlogCard } from "./BlogCard";
import { UI_COPY } from "@/lib/ui-copy";

export interface ArticleRelatedProps {
  relatedPosts: readonly BlogPost[];
}

export function ArticleRelated({ relatedPosts }: ArticleRelatedProps): React.JSX.Element | null {
  const copy = UI_COPY.MARKETING.BLOG;

  if (relatedPosts.length === 0) return null;

  return (
    <section className="fn-mkt-section fn-mkt-section-bordered">
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <h2 className="fn-mkt-section-title">{copy.RELATED_TITLE}</h2>
          <p className="fn-mkt-section-sub">{copy.RELATED_SUBTITLE}</p>
        </div>
        <div className="fn-mkt-blog-grid">
          {relatedPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

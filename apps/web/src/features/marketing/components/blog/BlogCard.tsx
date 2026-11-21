import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import type { BlogPost } from "../../data/blog-posts.types";
import { UI_COPY } from "@/lib/ui-copy";

export interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps): React.JSX.Element {
  const readMoreText = UI_COPY.MARKETING.BLOG.READ_MORE;

  return (
    <Link href={`/blog/${post.slug}`} className="fn-mkt-blog-card">
      <div className="fn-mkt-blog-meta">
        <span className="fn-mkt-badge">{post.category}</span>
        <div className="fn-mkt-blog-meta-info">
          <span className="fn-mkt-meta-pill">
            <Clock className="fn-mkt-meta-icon" />
            {post.readingTime}
          </span>
          <span className="fn-mkt-meta-dot" aria-hidden="true">
            •
          </span>
          <span className="fn-mkt-meta-pill">
            <Calendar className="fn-mkt-meta-icon" />
            {post.publishedAt}
          </span>
        </div>
      </div>
      <h2 className="fn-mkt-blog-title">{post.title}</h2>
      <p className="fn-mkt-blog-desc">{post.description}</p>
      <div className="fn-mkt-blog-read-more">
        <span>{readMoreText}</span>
        <ArrowRight className="fn-icon-xs" />
      </div>
    </Link>
  );
}

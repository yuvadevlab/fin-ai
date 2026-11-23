import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import type { BlogPost } from "../../data/blog-posts.types";
import { APP_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";

export interface ArticleHeroProps {
  post: BlogPost;
}

export function ArticleHero({ post }: ArticleHeroProps): React.JSX.Element {
  const backText = UI_COPY.MARKETING.BLOG.BACK_TO_ARTICLES;

  return (
    <section className="fn-mkt-hero fn-mkt-article-hero">
      <div className="fn-mkt-hero-glow" aria-hidden="true" />
      <div className="fn-mkt-container fn-mkt-hero-content">
        <Link href={APP_ROUTES.BLOG} className="fn-mkt-back-link">
          <ArrowLeft className="fn-icon-xs" />
          <span>{backText}</span>
        </Link>

        <div className="fn-mkt-badge">{post.category}</div>

        <h1 className="fn-mkt-hero-headline">{post.title}</h1>

        <p className="fn-mkt-hero-sub">{post.description}</p>

        <div className="fn-mkt-article-meta-row">
          <span className="fn-mkt-meta-pill">
            <User className="fn-mkt-meta-icon" />
            {post.author}
          </span>
          <span className="fn-mkt-meta-dot" aria-hidden="true">
            •
          </span>
          <span className="fn-mkt-meta-pill">
            <Calendar className="fn-mkt-meta-icon" />
            {post.publishedAt}
          </span>
          <span className="fn-mkt-meta-dot" aria-hidden="true">
            •
          </span>
          <span className="fn-mkt-meta-pill">
            <Clock className="fn-mkt-meta-icon" />
            {post.readingTime}
          </span>
        </div>
      </div>
    </section>
  );
}

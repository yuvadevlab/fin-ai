import React from "react";
import type { BlogPost } from "../../data/blog-posts.types";
import { BlogCard } from "./BlogCard";

export interface BlogGridProps {
  posts: readonly BlogPost[];
}

export function BlogGrid({ posts }: BlogGridProps): React.JSX.Element {
  return (
    <section className="fn-mkt-section fn-mkt-section-bordered">
      <div className="fn-mkt-container">
        <div className="fn-mkt-blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

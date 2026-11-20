/**
 * @file apps/web/src/features/marketing/data/blog-posts.ts
 * @description Catalog of high-authority educational personal finance articles for FinAI.
 * Aggregates deconstructed blog parts (Rule 4: < 250 lines).
 * @module @fin-ai/web/features/marketing/data
 */

import { BLOG_POSTS_PART1 } from "./blog-posts-part1.data";
import { BLOG_POSTS_PART2 } from "./blog-posts-part2.data";
import type { BlogPost, BlogPostSection } from "./blog-posts.types";

export type { BlogPost, BlogPostSection };

export const BLOG_POSTS: readonly BlogPost[] = [...BLOG_POSTS_PART1, ...BLOG_POSTS_PART2] as const;

export * from "./blog-posts.types";
export * from "./blog-posts-part1.data";
export * from "./blog-posts-part2.data";

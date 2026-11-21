/**
 * @file apps/web/src/features/marketing/data/blog-posts.types.ts
 * @description Domain interfaces for FinAI marketing blog resources.
 * @module @fin-ai/web/features/marketing/data/types
 */

export interface BlogPostSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  category: string;
  author: string;
  keyTakeaways: string[];
  sections: BlogPostSection[];
}

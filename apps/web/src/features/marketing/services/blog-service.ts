/**
 * @file apps/web/src/features/marketing/services/blog-service.ts
 * @description Centralized query service for FinAI educational blog posts and SSR metadata.
 * Mirrors devlab-shared/ui-docs service architecture.
 * @module @fin-ai/web/features/marketing/services/blog
 */

import type { Metadata } from "next";
import { BLOG_POSTS } from "../data/blog-posts";
import type { BlogPost } from "../data/blog-posts.types";
import { buildCanonicalUrl, FINAI_METADATA } from "@/lib/constants/seo.constants";

/**
 * Retrieves all published educational blog articles.
 */
export function getAllBlogPosts(): readonly BlogPost[] {
  return BLOG_POSTS;
}

/**
 * Retrieves all blog slugs for static route generation.
 */
export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}

/**
 * Finds a specific blog post by its URL slug.
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/**
 * Finds related blog posts for recommendations at the bottom of an article.
 */
export function getRelatedBlogPosts(currentSlug: string, count = 3): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, count);
}

/**
 * Generates dynamic SEO metadata for an educational blog post.
 */
export function getBlogArticleMetadata(slug: string): Metadata {
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found — FinAI Blog",
      description: "The requested financial strategy guide could not be found.",
    };
  }

  const url = buildCanonicalUrl(`/blog/${post.slug}`);

  return {
    title: `${post.title} | FinAI Blog`,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: FINAI_METADATA.SITE_NAME,
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/opengraph-image"],
    },
  };
}

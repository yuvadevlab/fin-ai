/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleHero, ArticleBody, ArticleRelated } from "@/features/marketing/components/blog";
import { CtaBannerSection } from "@/features/marketing/components/CtaBannerSection";
import {
  getAllBlogSlugs,
  getBlogPostBySlug,
  getBlogArticleMetadata,
  getRelatedBlogPosts,
} from "@/features/marketing/services/blog-service";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/constants/seo.constants";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getBlogArticleMetadata(slug);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(slug, 3);
  const articleSchema = generateArticleSchema({
    headline: post.title,
    description: post.description,
    slug: post.slug,
    datePublished: post.publishedAt,
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <div className="fn-mkt-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArticleHero post={post} />
      <ArticleBody post={post} />
      <ArticleRelated relatedPosts={relatedPosts} />
      <CtaBannerSection />
    </div>
  );
}

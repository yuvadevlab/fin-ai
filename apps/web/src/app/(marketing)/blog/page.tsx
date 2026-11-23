/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { BlogHero, BlogGrid } from "@/features/marketing/components/blog";
import { CtaBannerSection } from "@/features/marketing/components/CtaBannerSection";
import { getAllBlogPosts } from "@/features/marketing/services/blog-service";
import { PUBLIC_PAGES_SEO, FINAI_METADATA, buildCanonicalUrl } from "@/lib/constants/seo.constants";

export const metadata: Metadata = {
  title: PUBLIC_PAGES_SEO.BLOG.title,
  description: PUBLIC_PAGES_SEO.BLOG.description,
  alternates: {
    canonical: buildCanonicalUrl(PUBLIC_PAGES_SEO.BLOG.path),
  },
  openGraph: {
    title: PUBLIC_PAGES_SEO.BLOG.title,
    description: PUBLIC_PAGES_SEO.BLOG.description,
    url: buildCanonicalUrl(PUBLIC_PAGES_SEO.BLOG.path),
    siteName: FINAI_METADATA.SITE_NAME,
  },
};

export default function BlogListingPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="fn-mkt-page">
      <BlogHero />
      <BlogGrid posts={posts} />
      <CtaBannerSection />
    </div>
  );
}

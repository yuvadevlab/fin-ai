/**
 * @file apps/web/src/features/marketing/services/features-service.ts
 * @description Centralized query service for FinAI features catalog and SSR metadata.
 * Mirrors devlab-shared/ui-docs service architecture.
 * @module @fin-ai/web/features/marketing/services/features
 */

import type { Metadata } from "next";
import { FEATURES_REGISTRY } from "../data/features-registry";
import type { FeatureDoc } from "../data/features-registry.types";
import { PUBLIC_PAGES_SEO, FINAI_METADATA, buildCanonicalUrl } from "@/lib/constants/seo.constants";

/**
 * Retrieves all registered features in the catalog.
 */
export function getAllFeatures(): readonly FeatureDoc[] {
  return FEATURES_REGISTRY;
}

/**
 * Retrieves all registered feature slugs for Next.js generateStaticParams.
 */
export function getAllFeatureSlugs(): string[] {
  return FEATURES_REGISTRY.map((f) => f.slug);
}

/**
 * Finds a specific feature document by its URL slug.
 */
export function getFeatureBySlug(slug: string): FeatureDoc | undefined {
  return FEATURES_REGISTRY.find((f) => f.slug === slug);
}

/**
 * Generates SEO metadata for any registered feature page dynamically.
 */
export function getFeatureMetadata(slug: string): Metadata {
  const feature = getFeatureBySlug(slug);

  if (!feature) {
    return {
      title: "Feature Not Found — FinAI",
      description: "The requested feature documentation could not be found.",
    };
  }

  const seoConfig = PUBLIC_PAGES_SEO[feature.seoKey];
  const canonicalUrl = buildCanonicalUrl(seoConfig.path);

  return {
    title: seoConfig.title,
    description: seoConfig.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoConfig.title,
      description: seoConfig.description,
      url: canonicalUrl,
      siteName: FINAI_METADATA.SITE_NAME,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: feature.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoConfig.title,
      description: seoConfig.description,
      images: ["/opengraph-image"],
    },
  };
}

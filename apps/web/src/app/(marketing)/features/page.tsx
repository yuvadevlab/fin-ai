/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { CorePillarsSection } from "@/features/marketing/components/CorePillarsSection";
import { HowItWorksSection } from "@/features/marketing/components/HowItWorksSection";
import { SecuritySection } from "@/features/marketing/components/SecuritySection";
import { CtaBannerSection } from "@/features/marketing/components/CtaBannerSection";
import {
  PUBLIC_PAGES_SEO,
  FINAI_METADATA,
  buildCanonicalUrl,
  generateSoftwareApplicationSchema,
} from "@/lib/constants/seo.constants";

export const metadata: Metadata = {
  title: PUBLIC_PAGES_SEO.FEATURES.title,
  description: PUBLIC_PAGES_SEO.FEATURES.description,
  alternates: {
    canonical: buildCanonicalUrl(PUBLIC_PAGES_SEO.FEATURES.path),
  },
  openGraph: {
    title: PUBLIC_PAGES_SEO.FEATURES.title,
    description: PUBLIC_PAGES_SEO.FEATURES.description,
    url: buildCanonicalUrl(PUBLIC_PAGES_SEO.FEATURES.path),
    siteName: FINAI_METADATA.SITE_NAME,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FinAI Features" }],
  },
};

export default function FeaturesPage() {
  const schema = generateSoftwareApplicationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className="fn-mkt-hero">
        <div className="fn-mkt-hero-glow" aria-hidden="true" />
        <div className="fn-mkt-container fn-mkt-hero-content">
          <div className="fn-mkt-badge">Platform Overview</div>
          <h1 className="fn-mkt-hero-headline">The FinAI Intelligence Architecture</h1>
          <p className="fn-mkt-hero-sub">
            A comprehensive suite of personal wealth primitives engineered to replace fragmented
            banking apps, static spreadsheets, and expensive advisory retainers.
          </p>
        </div>
      </section>

      <CorePillarsSection />
      <HowItWorksSection />
      <SecuritySection />
      <CtaBannerSection />
    </>
  );
}

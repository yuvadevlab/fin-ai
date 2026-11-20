/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { HeroSection } from "@/features/marketing/components/HeroSection";
import { DashboardPreviewSection } from "@/features/marketing/components/DashboardPreviewSection";
import { CorePillarsSection } from "@/features/marketing/components/CorePillarsSection";
import { HowItWorksSection } from "@/features/marketing/components/HowItWorksSection";
import { SecuritySection } from "@/features/marketing/components/SecuritySection";
import { FaqSection } from "@/features/marketing/components/FaqSection";
import { CtaBannerSection } from "@/features/marketing/components/CtaBannerSection";
import {
  PUBLIC_PAGES_SEO,
  FINAI_METADATA,
  buildCanonicalUrl,
  generateSoftwareApplicationSchema,
  generateFaqSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/constants/seo.constants";
import { UI_COPY } from "@/lib/ui-copy";

export const metadata: Metadata = {
  title: PUBLIC_PAGES_SEO.HOME.title,
  description: PUBLIC_PAGES_SEO.HOME.description,
  alternates: {
    canonical: buildCanonicalUrl("/"),
  },
  openGraph: {
    title: PUBLIC_PAGES_SEO.HOME.title,
    description: PUBLIC_PAGES_SEO.HOME.description,
    url: buildCanonicalUrl("/"),
    siteName: FINAI_METADATA.SITE_NAME,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: FINAI_METADATA.OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PUBLIC_PAGES_SEO.HOME.title,
    description: PUBLIC_PAGES_SEO.HOME.description,
    images: ["/opengraph-image"],
  },
};

export default function MarketingHomePage(): React.JSX.Element {
  const softwareSchema = generateSoftwareApplicationSchema();
  const faqSchema = generateFaqSchema(UI_COPY.MARKETING.FAQ.ITEMS);
  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <HeroSection />
      <DashboardPreviewSection />
      <CorePillarsSection />
      <HowItWorksSection />
      <SecuritySection />
      <FaqSection />
      <CtaBannerSection />
    </>
  );
}

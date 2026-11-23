import React from "react";
import { notFound } from "next/navigation";
import { getFeatureBySlug } from "../../services/features-service";
import type { FeatureDoc } from "../../data/features-registry.types";
import { FeatureHero } from "./FeatureHero";
import { FeatureCapabilitiesGrid } from "./FeatureCapabilitiesGrid";
import { FeatureRelatedLinks } from "./FeatureRelatedLinks";
import { CtaBannerSection } from "../CtaBannerSection";
import { generateBreadcrumbSchema } from "@/lib/constants/seo.constants";

export interface FeatureDetailViewProps {
  slug?: string;
  doc?: FeatureDoc;
}

export function FeatureDetailView({ slug, doc }: FeatureDetailViewProps): React.JSX.Element {
  const feature = doc ?? (slug ? getFeatureBySlug(slug) : undefined);

  if (!feature) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: feature.badge, path: `/${feature.slug}` },
  ]);

  return (
    <div className="fn-mkt-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FeatureHero badge={feature.badge} title={feature.title} description={feature.description} />
      <FeatureCapabilitiesGrid capabilities={feature.capabilities} />
      <FeatureRelatedLinks relatedLinks={feature.relatedLinks} />
      <CtaBannerSection />
    </div>
  );
}

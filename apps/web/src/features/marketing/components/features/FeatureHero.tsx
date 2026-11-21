"use client";

/**
 * @file apps/web/src/features/marketing/components/features/FeatureHero.tsx
 * @description Dedicated hero section for feature landing pages with early access waitlist trigger and accessible semantics.
 * @module @fin-ai/web/features/marketing/components/features/FeatureHero
 */

import React from "react";
import Link from "next/link";
import { Button, Badge } from "@fin-ai/ui";
import { ArrowRight } from "lucide-react";
import { APP_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";
import { useEarlyAccess } from "../../context/EarlyAccessContext";

export interface FeatureHeroProps {
  badge: string;
  title: string;
  description: string;
}

export function FeatureHero({ badge, title, description }: FeatureHeroProps): React.JSX.Element {
  const copy = UI_COPY.MARKETING.FEATURE_PAGES;
  const { openModal } = useEarlyAccess();

  return (
    <section className="fn-mkt-hero" aria-labelledby="feature-hero-heading">
      <div className="fn-mkt-hero-glow" aria-hidden="true" />
      <div className="fn-mkt-container fn-mkt-hero-content">
        <Badge className="fn-mkt-badge">{badge}</Badge>
        <h1 id="feature-hero-heading" className="fn-mkt-hero-headline">
          {title}
        </h1>
        <p className="fn-mkt-hero-sub">{description}</p>
        <div className="fn-mkt-hero-actions">
          <Button size="lg" onClick={openModal}>
            {copy.PRIMARY_CTA}
            <ArrowRight className="fn-mkt-btn-arrow" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={APP_ROUTES.FEATURES}>{copy.SECONDARY_CTA}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

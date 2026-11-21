"use client";

/**
 * @file apps/web/src/features/marketing/components/FeatureDeepDiveView.tsx
 * @description Detailed feature presentation view with capabilities breakdown, related features, and early access trigger.
 * @module @fin-ai/web/features/marketing/components/FeatureDeepDiveView
 */

import React from "react";
import Link from "next/link";
import { Button, Badge } from "@fin-ai/ui";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { CtaBannerSection } from "./CtaBannerSection";
import { APP_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";
import { useEarlyAccess } from "../context/EarlyAccessContext";

export interface FeatureDeepDiveProps {
  badge: string;
  title: string;
  description: string;
  capabilities: Array<{
    title: string;
    description: string;
    benefits: string[];
  }>;
  relatedLinks: Array<{
    title: string;
    href: string;
    description: string;
  }>;
}

export function FeatureDeepDiveView({
  badge,
  title,
  description,
  capabilities,
  relatedLinks,
}: FeatureDeepDiveProps): React.JSX.Element {
  const { openModal } = useEarlyAccess();
  const copy = UI_COPY.MARKETING.FEATURE_PAGES;

  return (
    <div className="fn-mkt-page">
      {/* Feature Hero */}
      <section className="fn-mkt-hero" aria-labelledby="feature-hero-title">
        <div className="fn-mkt-hero-glow" aria-hidden="true" />
        <div className="fn-mkt-container fn-mkt-hero-content">
          <Badge className="fn-mkt-badge">{badge}</Badge>
          <h1 id="feature-hero-title" className="fn-mkt-hero-headline">
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

      {/* Capability Breakdown */}
      <section
        className="fn-mkt-section fn-mkt-section-bordered"
        aria-label="Capabilities and architectural benefits"
      >
        <div className="fn-mkt-container">
          <div className="fn-mkt-grid-3">
            {capabilities.map((cap, idx) => (
              <div key={cap.title} className="fn-mkt-card fn-mkt-capability-card">
                <div className="fn-mkt-card-header-row">
                  <span className="fn-mkt-step-badge" aria-hidden="true">
                    {copy.STEP_PREFIX}
                    {idx + 1}
                  </span>
                  <h2 className="fn-mkt-card-title">{cap.title}</h2>
                </div>
                <p className="fn-mkt-card-desc">{cap.description}</p>
                <ul
                  className="fn-mkt-benefits-list fn-mkt-unstyled-list"
                  role="list"
                  aria-label={`${cap.title} core benefits`}
                >
                  {cap.benefits.map((b) => (
                    <li key={b} className="fn-mkt-benefit-item">
                      <div className="fn-mkt-benefit-icon-wrap" aria-hidden="true">
                        <CheckCircle2 className="fn-mkt-benefit-icon" />
                      </div>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Features Internal Linking */}
      {relatedLinks.length > 0 && (
        <section
          className="fn-mkt-section fn-mkt-section-bordered"
          aria-labelledby="related-features-heading"
        >
          <div className="fn-mkt-container">
            <div className="fn-mkt-section-header">
              <h2 id="related-features-heading" className="fn-mkt-section-title">
                {copy.RELATED_TITLE}
              </h2>
              <p className="fn-mkt-section-sub">{copy.RELATED_SUBTITLE}</p>
            </div>
            <div className="fn-mkt-grid-3">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="fn-mkt-card"
                  aria-label={`${link.title}: ${link.description}`}
                >
                  <h3 className="fn-mkt-card-title">{link.title}</h3>
                  <p className="fn-mkt-card-desc">{link.description}</p>
                  <div className="fn-mkt-card-action" aria-hidden="true">
                    <span>{copy.LEARN_MORE}</span>
                    <ArrowRight className="fn-mkt-card-action-icon" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBannerSection />
    </div>
  );
}

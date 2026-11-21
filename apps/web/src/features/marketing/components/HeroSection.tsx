"use client";

/**
 * @file apps/web/src/features/marketing/components/HeroSection.tsx
 * @description Accessible hero banner with brand value proposition and early access waitlist trigger.
 * @module @fin-ai/web/features/marketing/components/HeroSection
 */

import React from "react";
import Link from "next/link";
import { Button, Badge } from "@fin-ai/ui";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import { APP_ROUTES } from "@/lib/routes";
import { useEarlyAccess } from "../context/EarlyAccessContext";

export function HeroSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.HERO;
  const { openModal } = useEarlyAccess();

  return (
    <section className="fn-mkt-hero" aria-labelledby="hero-headline">
      <div className="fn-mkt-hero-glow" aria-hidden="true" />
      <div className="fn-mkt-container fn-mkt-hero-content">
        <Badge className="fn-mkt-badge">
          <Sparkles className="fn-icon-xs" aria-hidden="true" />
          <span>{copy.BADGE}</span>
        </Badge>

        <h1 id="hero-headline" className="fn-mkt-hero-headline">
          {copy.HEADLINE_PRE}{" "}
          <span className="fn-mkt-hero-headline-accent">{copy.HEADLINE_ACCENT}</span>
        </h1>

        <p className="fn-mkt-hero-sub">{copy.SUBTITLE}</p>

        <div className="fn-mkt-hero-actions">
          <Button size="lg" onClick={openModal}>
            {copy.CTA_PRIMARY}
            <ArrowRight className="fn-mkt-btn-arrow" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={APP_ROUTES.FEATURES}>{copy.CTA_SECONDARY}</Link>
          </Button>
        </div>

        <ul
          className="fn-mkt-trust-strip"
          role="list"
          aria-label="Security and encryption standards"
        >
          {copy.TRUST_PILLS.map((pill) => (
            <li key={pill} className="fn-mkt-trust-item">
              <ShieldCheck className="fn-mkt-trust-icon" aria-hidden="true" />
              <span>{pill}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

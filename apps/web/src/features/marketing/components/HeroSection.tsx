import React from "react";
import Link from "next/link";
import { Button } from "@fin-ai/ui";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import { DEVLAB_PORTAL_ROUTES, APP_ROUTES } from "@/lib/routes";

export function HeroSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.HERO;
  const registerUrl = DEVLAB_PORTAL_ROUTES.REGISTER();

  return (
    <section className="fn-mkt-hero">
      <div className="fn-mkt-hero-glow" aria-hidden="true" />
      <div className="fn-mkt-container fn-mkt-hero-content">
        <div className="fn-mkt-badge">
          <Sparkles className="fn-icon-xs" />
          <span>{copy.BADGE}</span>
        </div>

        <h1 className="fn-mkt-hero-headline">
          {copy.HEADLINE_PRE}{" "}
          <span className="fn-mkt-hero-headline-accent">{copy.HEADLINE_ACCENT}</span>
        </h1>

        <p className="fn-mkt-hero-sub">{copy.SUBTITLE}</p>

        <div className="fn-mkt-hero-actions">
          <Button size="lg" asChild>
            <a href={registerUrl}>
              {copy.CTA_PRIMARY}
              <ArrowRight className="fn-mkt-btn-arrow" />
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={APP_ROUTES.FEATURES}>{copy.CTA_SECONDARY}</Link>
          </Button>
        </div>

        <div className="fn-mkt-trust-strip">
          {copy.TRUST_PILLS.map((pill) => (
            <div key={pill} className="fn-mkt-trust-item">
              <ShieldCheck className="fn-mkt-trust-icon" />
              <span>{pill}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

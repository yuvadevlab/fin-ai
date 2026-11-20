import React from "react";
import Link from "next/link";
import { Button } from "@fin-ai/ui";
import { ArrowRight } from "lucide-react";
import { DEVLAB_PORTAL_ROUTES, APP_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";

export interface FeatureHeroProps {
  badge: string;
  title: string;
  description: string;
}

export function FeatureHero({ badge, title, description }: FeatureHeroProps): React.JSX.Element {
  const copy = UI_COPY.MARKETING.FEATURE_PAGES;
  const registerUrl = DEVLAB_PORTAL_ROUTES.REGISTER();

  return (
    <section className="fn-mkt-hero">
      <div className="fn-mkt-hero-glow" aria-hidden="true" />
      <div className="fn-mkt-container fn-mkt-hero-content">
        <div className="fn-mkt-badge">{badge}</div>
        <h1 className="fn-mkt-hero-headline">{title}</h1>
        <p className="fn-mkt-hero-sub">{description}</p>
        <div className="fn-mkt-hero-actions">
          <Button size="lg" asChild>
            <a href={registerUrl}>
              {copy.PRIMARY_CTA}
              <ArrowRight className="fn-mkt-btn-arrow" />
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={APP_ROUTES.FEATURES}>{copy.SECONDARY_CTA}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

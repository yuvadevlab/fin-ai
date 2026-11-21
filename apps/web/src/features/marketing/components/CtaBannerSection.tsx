"use client";

/**
 * @file apps/web/src/features/marketing/components/CtaBannerSection.tsx
 * @description Bottom CTA conversion banner with early access waitlist modal trigger and accessible landmarks.
 * @module @fin-ai/web/features/marketing/components/CtaBannerSection
 */

import React from "react";
import { Button } from "@fin-ai/ui";
import { ArrowRight } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/routes";
import { useEarlyAccess } from "../context/EarlyAccessContext";

export function CtaBannerSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.CTA_BANNER;
  const loginUrl = DEVLAB_PORTAL_ROUTES.LOGIN();
  const { openModal } = useEarlyAccess();

  return (
    <section className="fn-mkt-cta-wrap" aria-labelledby="cta-banner-title">
      <div className="fn-mkt-container">
        <div className="fn-mkt-cta-card">
          <h2 id="cta-banner-title" className="fn-mkt-cta-title">
            {copy.TITLE}
          </h2>
          <p className="fn-mkt-cta-sub">{copy.SUBTITLE}</p>
          <div className="fn-mkt-cta-actions">
            <Button size="lg" onClick={openModal}>
              {copy.PRIMARY_BTN}
              <ArrowRight className="fn-mkt-btn-arrow" aria-hidden="true" />
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={loginUrl}>{copy.SECONDARY_BTN}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

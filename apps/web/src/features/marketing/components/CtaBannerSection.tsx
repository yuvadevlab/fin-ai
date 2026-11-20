import React from "react";
import { Button } from "@fin-ai/ui";
import { ArrowRight } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/routes";

export function CtaBannerSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.CTA_BANNER;
  const registerUrl = DEVLAB_PORTAL_ROUTES.REGISTER();
  const loginUrl = DEVLAB_PORTAL_ROUTES.LOGIN();

  return (
    <section className="fn-mkt-cta-wrap">
      <div className="fn-mkt-container">
        <div className="fn-mkt-cta-card">
          <h2 className="fn-mkt-cta-title">{copy.TITLE}</h2>
          <p className="fn-mkt-cta-sub">{copy.SUBTITLE}</p>
          <div className="fn-mkt-cta-actions">
            <Button size="lg" asChild>
              <a href={registerUrl}>
                {copy.PRIMARY_BTN}
                <ArrowRight className="fn-mkt-btn-arrow" />
              </a>
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

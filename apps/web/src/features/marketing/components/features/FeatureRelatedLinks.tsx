import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FeatureRelatedLink } from "../../data/features-registry.types";
import { UI_COPY } from "@/lib/ui-copy";

export interface FeatureRelatedLinksProps {
  relatedLinks: readonly FeatureRelatedLink[];
}

export function FeatureRelatedLinks({
  relatedLinks,
}: FeatureRelatedLinksProps): React.JSX.Element | null {
  const copy = UI_COPY.MARKETING.FEATURE_PAGES;

  if (relatedLinks.length === 0) return null;

  return (
    <section className="fn-mkt-section fn-mkt-section-bordered">
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <h2 className="fn-mkt-section-title">{copy.RELATED_TITLE}</h2>
          <p className="fn-mkt-section-sub">{copy.RELATED_SUBTITLE}</p>
        </div>
        <div className="fn-mkt-grid-3">
          {relatedLinks.map((link) => (
            <Link key={link.href} href={link.href} className="fn-mkt-card">
              <h3 className="fn-mkt-card-title">{link.title}</h3>
              <p className="fn-mkt-card-desc">{link.description}</p>
              <div className="fn-mkt-card-action">
                <span>{copy.LEARN_MORE}</span>
                <ArrowRight className="fn-mkt-card-action-icon" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

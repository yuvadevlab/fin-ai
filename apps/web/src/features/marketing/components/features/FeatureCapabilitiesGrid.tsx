import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { FeatureCapability } from "../../data/features-registry.types";
import { UI_COPY } from "@/lib/ui-copy";

export interface FeatureCapabilitiesGridProps {
  capabilities: readonly FeatureCapability[];
}

export function FeatureCapabilitiesGrid({
  capabilities,
}: FeatureCapabilitiesGridProps): React.JSX.Element {
  const prefix = UI_COPY.MARKETING.FEATURE_PAGES.STEP_PREFIX;

  return (
    <section className="fn-mkt-section fn-mkt-section-bordered">
      <div className="fn-mkt-container">
        <div className="fn-mkt-grid-3">
          {capabilities.map((cap, idx) => (
            <div key={cap.title} className="fn-mkt-card fn-mkt-capability-card">
              <div className="fn-mkt-card-header-row">
                <span className="fn-mkt-step-badge">
                  {prefix}
                  {idx + 1}
                </span>
                <h2 className="fn-mkt-card-title">{cap.title}</h2>
              </div>
              <p className="fn-mkt-card-desc">{cap.description}</p>
              <div className="fn-mkt-benefits-list">
                {cap.benefits.map((b) => (
                  <div key={b} className="fn-mkt-benefit-item">
                    <div className="fn-mkt-benefit-icon-wrap" aria-hidden="true">
                      <CheckCircle2 className="fn-mkt-benefit-icon" />
                    </div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

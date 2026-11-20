import React from "react";
import { UI_COPY } from "@/lib/ui-copy";

export function HowItWorksSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.HOW_IT_WORKS;

  return (
    <section className="fn-mkt-section fn-mkt-section-bordered">
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <div className="fn-mkt-badge">{copy.BADGE}</div>
          <h2 className="fn-mkt-section-title">{copy.TITLE}</h2>
          <p className="fn-mkt-section-sub">{copy.SUBTITLE}</p>
        </div>

        <div className="fn-mkt-steps-grid">
          {copy.STEPS.map((step) => (
            <div key={step.number} className="fn-mkt-step-card">
              <span className="fn-mkt-step-num">{step.number}</span>
              <h3 className="fn-mkt-card-title">{step.title}</h3>
              <p className="fn-mkt-card-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

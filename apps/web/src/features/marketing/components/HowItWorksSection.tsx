import React from "react";
import { Badge } from "@fin-ai/ui";
import { UI_COPY } from "@/lib/ui-copy";

export function HowItWorksSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.HOW_IT_WORKS;

  return (
    <section className="fn-mkt-section fn-mkt-section-bordered" aria-labelledby="workflow-heading">
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <Badge className="fn-mkt-badge">{copy.BADGE}</Badge>
          <h2 id="workflow-heading" className="fn-mkt-section-title">
            {copy.TITLE}
          </h2>
          <p className="fn-mkt-section-sub">{copy.SUBTITLE}</p>
        </div>

        <ol className="fn-mkt-steps-grid" aria-label="FinAI wealth creation steps">
          {copy.STEPS.map((step) => (
            <li key={step.number} className="fn-mkt-step-card">
              <span className="fn-mkt-step-num" aria-hidden="true">
                {step.number}
              </span>
              <h3 className="fn-mkt-card-title">{step.title}</h3>
              <p className="fn-mkt-card-desc">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

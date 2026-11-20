import React from "react";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

const SECURITY_ICONS = [ShieldCheck, Lock, EyeOff];

export function SecuritySection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.SECURITY;

  return (
    <section className="fn-mkt-section fn-mkt-section-bordered">
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <div className="fn-mkt-badge">{copy.BADGE}</div>
          <h2 className="fn-mkt-section-title">{copy.TITLE}</h2>
          <p className="fn-mkt-section-sub">{copy.SUBTITLE}</p>
        </div>

        <div className="fn-mkt-grid-3">
          {copy.POINTS.map((point, index) => {
            const Icon = SECURITY_ICONS[index] || ShieldCheck;
            return (
              <div key={point.title} className="fn-mkt-card">
                <div className="fn-mkt-card-icon">
                  <Icon className="fn-icon-md" />
                </div>
                <h3 className="fn-mkt-card-title">{point.title}</h3>
                <p className="fn-mkt-card-desc">{point.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

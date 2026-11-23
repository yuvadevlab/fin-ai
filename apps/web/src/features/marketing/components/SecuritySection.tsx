import React from "react";
import { Badge } from "@fin-ai/ui";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

const SECURITY_ICONS = [ShieldCheck, Lock, EyeOff];

export function SecuritySection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.SECURITY;

  return (
    <section className="fn-mkt-section fn-mkt-section-bordered" aria-labelledby="security-heading">
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <Badge className="fn-mkt-badge">{copy.BADGE}</Badge>
          <h2 id="security-heading" className="fn-mkt-section-title">
            {copy.TITLE}
          </h2>
          <p className="fn-mkt-section-sub">{copy.SUBTITLE}</p>
        </div>

        <ul className="fn-mkt-grid-3 fn-mkt-unstyled-list" role="list">
          {copy.POINTS.map((point, index) => {
            const Icon = SECURITY_ICONS[index] || ShieldCheck;
            return (
              <li key={point.title} className="fn-mkt-card">
                <div className="fn-mkt-card-icon" aria-hidden="true">
                  <Icon className="fn-icon-md" />
                </div>
                <h3 className="fn-mkt-card-title">{point.title}</h3>
                <p className="fn-mkt-card-desc">{point.desc}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

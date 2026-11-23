import React from "react";
import Link from "next/link";
import { Badge } from "@fin-ai/ui";
import {
  ArrowLeftRight,
  PiggyBank,
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

const ICON_MAP = {
  "expense-tracking": ArrowLeftRight,
  "budget-planning": PiggyBank,
  "ai-financial-advisor": Sparkles,
  "wealth-management": TrendingUp,
  "financial-goals": Target,
  "privacy-first": ShieldCheck,
};

export function CorePillarsSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.PILLARS;

  return (
    <section className="fn-mkt-section" id="features" aria-labelledby="features-heading">
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <Badge className="fn-mkt-badge">{copy.SECTION_BADGE}</Badge>
          <h2 id="features-heading" className="fn-mkt-section-title">
            {copy.TITLE}
          </h2>
          <p className="fn-mkt-section-sub">{copy.SUBTITLE}</p>
        </div>

        <div className="fn-mkt-grid-3">
          {copy.ITEMS.map((item) => {
            const Icon = ICON_MAP[item.id as keyof typeof ICON_MAP] || Sparkles;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="fn-mkt-card"
                aria-label={`${item.title}: ${item.description}`}
              >
                <div className="fn-mkt-card-icon" aria-hidden="true">
                  <Icon className="fn-icon-md" />
                </div>
                <h3 className="fn-mkt-card-title">{item.title}</h3>
                <p className="fn-mkt-card-desc">{item.description}</p>
                <div className="fn-mkt-card-action" aria-hidden="true">
                  <span>{copy.EXPLORE_ACTION}</span>
                  <ArrowRight className="fn-mkt-card-action-icon" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

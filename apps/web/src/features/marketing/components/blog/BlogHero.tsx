import React from "react";
import { BookOpen } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

export function BlogHero(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.BLOG;

  return (
    <section className="fn-mkt-hero">
      <div className="fn-mkt-hero-glow" aria-hidden="true" />
      <div className="fn-mkt-container fn-mkt-hero-content">
        <div className="fn-mkt-badge">
          <BookOpen className="fn-icon-xs" />
          <span>{copy.BADGE}</span>
        </div>
        <h1 className="fn-mkt-hero-headline">{copy.TITLE}</h1>
        <p className="fn-mkt-hero-sub">{copy.SUBTITLE}</p>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import { Button } from "@fin-ai/ui";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { CtaBannerSection } from "./CtaBannerSection";
import { DEVLAB_PORTAL_ROUTES, APP_ROUTES } from "@/lib/routes";

export interface FeatureDeepDiveProps {
  badge: string;
  title: string;
  description: string;
  capabilities: Array<{
    title: string;
    description: string;
    benefits: string[];
  }>;
  relatedLinks: Array<{
    title: string;
    href: string;
    description: string;
  }>;
}

export function FeatureDeepDiveView({
  badge,
  title,
  description,
  capabilities,
  relatedLinks,
}: FeatureDeepDiveProps): React.JSX.Element {
  const registerUrl = DEVLAB_PORTAL_ROUTES.REGISTER();

  return (
    <div className="fn-mkt-page">
      {/* Feature Hero */}
      <section className="fn-mkt-hero">
        <div className="fn-mkt-hero-glow" aria-hidden="true" />
        <div className="fn-mkt-container fn-mkt-hero-content">
          <div className="fn-mkt-badge">{badge}</div>
          <h1 className="fn-mkt-hero-headline">{title}</h1>
          <p className="fn-mkt-hero-sub">{description}</p>
          <div className="fn-mkt-hero-actions">
            <Button size="lg" asChild>
              <a href={registerUrl}>
                Get Started Free
                <ArrowRight className="fn-mkt-btn-arrow" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={APP_ROUTES.FEATURES}>All Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Capability Breakdown */}
      <section className="fn-mkt-section fn-mkt-section-bordered">
        <div className="fn-mkt-container">
          <div className="fn-mkt-grid-3">
            {capabilities.map((cap, idx) => (
              <div key={cap.title} className="fn-mkt-card fn-mkt-capability-card">
                <div className="fn-mkt-card-header-row">
                  <span className="fn-mkt-step-badge">0{idx + 1}</span>
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

      {/* Related Features Internal Linking */}
      {relatedLinks.length > 0 && (
        <section className="fn-mkt-section fn-mkt-section-bordered">
          <div className="fn-mkt-container">
            <div className="fn-mkt-section-header">
              <h2 className="fn-mkt-section-title">Explore Related Capabilities</h2>
              <p className="fn-mkt-section-sub">
                FinAI&apos;s modular architecture connects every aspect of your financial life.
              </p>
            </div>
            <div className="fn-mkt-grid-3">
              {relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="fn-mkt-card">
                  <h3 className="fn-mkt-card-title">{link.title}</h3>
                  <p className="fn-mkt-card-desc">{link.description}</p>
                  <div className="fn-mkt-card-action">
                    <span>Learn more</span>
                    <ArrowRight className="fn-mkt-card-action-icon" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBannerSection />
    </div>
  );
}

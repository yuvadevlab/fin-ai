import React from "react";
import Image from "next/image";
import { Sparkles, ShieldCheck } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

export function DashboardPreviewSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.PREVIEW;

  return (
    <section className="fn-mkt-preview-section">
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <div className="fn-mkt-badge">{copy.BADGE}</div>
          <h2 className="fn-mkt-section-title">{copy.TITLE}</h2>
          <p className="fn-mkt-section-sub">{copy.SUBTITLE}</p>
        </div>

        <div className="fn-mkt-preview-frame">
          <div className="fn-mkt-preview-header">
            <div className="fn-mkt-preview-dots">
              <span className="fn-mkt-preview-dot" />
              <span className="fn-mkt-preview-dot" />
              <span className="fn-mkt-preview-dot" />
            </div>
            <span className="fn-mkt-preview-url">fin-ai.yuvadevlab.app/dashboard</span>
            <div className="fn-mkt-badge">Live Preview</div>
          </div>

          <div className="fn-mkt-preview-media">
            {/* Light Theme Screenshot */}
            <Image
              src="/images/dashboard-preview-light.png"
              alt="FinAI Personal Finance & Wealth Management Dashboard — Light Mode"
              width={1440}
              height={900}
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              className="fn-mkt-preview-img fn-mkt-preview-img--light"
            />
            {/* Dark Theme Screenshot */}
            <Image
              src="/images/dashboard-preview-dark.png"
              alt="FinAI AI-Powered Personal Finance & Wealth Management Dashboard — Dark Mode"
              width={1440}
              height={900}
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              className="fn-mkt-preview-img fn-mkt-preview-img--dark"
            />
          </div>
        </div>

        {/* Cohesive Financial Command Dock */}
        <div className="fn-mkt-preview-dock">
          <div className="fn-mkt-preview-dock-item">
            <div className="fn-mkt-preview-dock-pulse-wrap" aria-hidden="true">
              <span className="fn-mkt-preview-dock-pulse" />
            </div>
            <div className="fn-mkt-preview-dock-info">
              <span className="fn-mkt-preview-dock-val">{copy.METRICS[0].value}</span>
              <span className="fn-mkt-preview-dock-lbl">{copy.METRICS[0].label}</span>
            </div>
          </div>

          <div className="fn-mkt-preview-dock-divider" aria-hidden="true" />

          <div className="fn-mkt-preview-dock-item">
            <div className="fn-mkt-preview-dock-icon-wrap" aria-hidden="true">
              <Sparkles className="fn-mkt-dock-icon" />
            </div>
            <div className="fn-mkt-preview-dock-info">
              <span className="fn-mkt-preview-dock-val">{copy.METRICS[1].value}</span>
              <span className="fn-mkt-preview-dock-lbl">{copy.METRICS[1].label}</span>
            </div>
          </div>

          <div className="fn-mkt-preview-dock-divider" aria-hidden="true" />

          <div className="fn-mkt-preview-dock-item">
            <div className="fn-mkt-preview-dock-icon-wrap" aria-hidden="true">
              <ShieldCheck className="fn-mkt-dock-icon" />
            </div>
            <div className="fn-mkt-preview-dock-info">
              <span className="fn-mkt-preview-dock-val">{copy.METRICS[2].value}</span>
              <span className="fn-mkt-preview-dock-lbl">{copy.METRICS[2].label}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X, RefreshCw, ExternalLink, ChevronDown } from "lucide-react";
import { cn, MarkdownContent } from "@fin-ai/ui";
import { useAiInsight, type InsightPage } from "@/features/ai-advisor";
import { FEATURE_FLAGS, APP_ROUTES } from "@/lib";
import { UI_COPY } from "@/lib/ui-copy";

/** Map route segments to their InsightPage value */
const ROUTE_TO_PAGE: Record<string, InsightPage> = {
  "": "dashboard",
  dashboard: "dashboard",
  health: "health",
  transactions: "transactions",
  budgets: "budgets",
  investments: "investments",
  goals: "goals",
  reports: "reports",
  accounts: "accounts",
};

const PAGE_TITLES: Record<InsightPage, string> = {
  dashboard: UI_COPY.ADVISOR.WIDGET.PAGE_TITLES.dashboard,
  health: UI_COPY.ADVISOR.WIDGET.PAGE_TITLES.health,
  transactions: UI_COPY.ADVISOR.WIDGET.PAGE_TITLES.transactions,
  budgets: UI_COPY.ADVISOR.WIDGET.PAGE_TITLES.budgets,
  investments: UI_COPY.ADVISOR.WIDGET.PAGE_TITLES.investments,
  goals: UI_COPY.ADVISOR.WIDGET.PAGE_TITLES.goals,
  reports: UI_COPY.ADVISOR.WIDGET.PAGE_TITLES.reports,
  accounts: UI_COPY.ADVISOR.WIDGET.PAGE_TITLES.linkedAccounts,
};

function resolveInsightPage(pathname: string): InsightPage | null {
  const segment = pathname.replace(/^\//, "").split("/")[0] ?? "";
  return ROUTE_TO_PAGE[segment] ?? null;
}

export function AIInsightFloatingWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const page = resolveInsightPage(pathname);
  const { text, isStreaming, isError, refetch } = useAiInsight({
    page: page ?? "dashboard",
    enabled: false,
  });

  // Reset open state when navigating to a new route
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Don't render on the AI advisor page itself or if feature flag off
  if (!FEATURE_FLAGS.AI_INSIGHT || !page || pathname.startsWith(APP_ROUTES.ADVISOR)) {
    return null;
  }

  const hasLoaded = !!text || isStreaming || isError;
  const pageTitle = PAGE_TITLES[page] ?? UI_COPY.ADVISOR.WIDGET.PAGE_TITLES.fallback;
  // Pure derived state: show notification dot only if insight was generated but widget is closed
  const hasNewInsight = !isOpen && !isStreaming && Boolean(text);

  const handleGenerate = () => {
    refetch();
  };

  const handleToggle = () => {
    setIsOpen((v) => !v);
  };

  return (
    <div className="fn-insight-widget-root">
      {/* Expanded flyout panel — opens directly above the trigger button */}
      <div className={cn("fn-insight-window", isOpen && "is-open")} aria-hidden={!isOpen}>
        {/* Panel header with glacier knife-shine effect */}
        <div className="fn-insight-header">
          <div className="fn-insight-header-content">
            <Sparkles className="fn-insight-header-sparkle" aria-hidden="true" />
            <div>
              <span className="fn-insight-title">{pageTitle}</span>
              <p className="fn-insight-live-text">{UI_COPY.ADVISOR.WIDGET.LIVE_ANALYSIS}</p>
            </div>
            {isStreaming && (
              <span className="fn-insight-live-badge">{UI_COPY.ADVISOR.WIDGET.LIVE_BADGE}</span>
            )}
          </div>
          <div className="fn-insight-header-actions">
            {hasLoaded && !isStreaming && (
              <button
                onClick={refetch}
                title={UI_COPY.ADVISOR.WIDGET.REFRESH}
                className="fn-insight-header-btn"
              >
                <RefreshCw className="fn-insight-header-btn-icon" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="fn-insight-header-btn"
              aria-label={UI_COPY.ADVISOR.WIDGET.CLOSE}
            >
              <ChevronDown className="fn-insight-header-btn-icon" />
            </button>
          </div>
        </div>

        {/* Panel body */}
        <div className="fn-insight-body">
          {isError ? (
            <p className="fn-insight-error">{UI_COPY.ADVISOR.WIDGET.ERROR}</p>
          ) : isStreaming && !text ? (
            <div className="fn-insight-loading">
              <RefreshCw className="fn-insight-loading-spinner" />
              <span>{UI_COPY.ADVISOR.WIDGET.ANALYZING(pageTitle)}</span>
            </div>
          ) : text ? (
            <MarkdownContent content={text} className="fn-insight-prose">
              {isStreaming && <span className="fn-insight-cursor">▍</span>}
            </MarkdownContent>
          ) : (
            <div className="fn-insight-empty">
              <p className="fn-insight-empty-desc">
                {UI_COPY.ADVISOR.WIDGET.READY_DESCRIPTION(pageTitle)}
              </p>
              <button onClick={handleGenerate} className="fn-insight-generate-btn">
                <Sparkles className="fn-insight-btn-icon" />
                {UI_COPY.ADVISOR.WIDGET.GENERATE}
              </button>
            </div>
          )}
        </div>

        {/* Footer link to full advisor */}
        {hasLoaded && (
          <div className="fn-insight-footer">
            <Link
              href={APP_ROUTES.ADVISOR}
              className="fn-insight-footer-link"
              onClick={() => setIsOpen(false)}
            >
              <ExternalLink className="fn-insight-footer-icon" />
              {UI_COPY.ADVISOR.WIDGET.ASK_IN_CHAT}
            </Link>
            <span className="fn-insight-footer-brand">{UI_COPY.ADVISOR.WIDGET.BRAND}</span>
          </div>
        )}
      </div>

      {/* FAB trigger button — spacious pill with icon + title */}
      <div className="fn-insight-trigger-wrap">
        <button
          onClick={handleToggle}
          aria-label={isOpen ? UI_COPY.ADVISOR.WIDGET.CLOSE : UI_COPY.ADVISOR.WIDGET.OPEN}
          aria-expanded={isOpen}
          className={cn("fn-insight-trigger", isOpen && "is-open")}
        >
          <Sparkles
            className={cn("fn-insight-trigger-icon", isOpen ? "is-open" : "is-primary")}
            aria-hidden="true"
          />

          <span className="fn-insight-trigger-label">
            {isOpen ? UI_COPY.ADVISOR.WIDGET.TOGGLE_CLOSE : UI_COPY.ADVISOR.WIDGET.TOGGLE_OPEN}
          </span>

          {/* Notification dot — shown when insight is ready but panel is closed */}
          {hasNewInsight && !isOpen && (
            <span className="fn-insight-notification-dot" aria-hidden="true" />
          )}

          {isOpen && (
            <span className="fn-insight-trigger-close" aria-hidden="true">
              <X className="fn-icon-sm" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X, RefreshCw, ExternalLink, ChevronDown } from "lucide-react";
import { cn, MarkdownContent } from "@finai/ui";
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
      <div
        className={cn(
          "fn-insight-window",
          isOpen
            ? "mb-1 max-h-115 translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 translate-y-3 opacity-0",
        )}
        aria-hidden={!isOpen}
      >
        {/* Panel header with glacier knife-shine effect */}
        <div className="fn-insight-header">
          <div className="fn-insight-header-content">
            <Sparkles
              className="size-4 shrink-0 animate-pulse text-emerald-300"
              aria-hidden="true"
            />
            <div>
              <span className="block text-sm font-semibold tracking-tight text-white">
                {pageTitle}
              </span>
              <p className="mt-0.5 text-[10px] leading-none font-medium text-emerald-100/80">
                {UI_COPY.ADVISOR.WIDGET.LIVE_ANALYSIS}
              </p>
            </div>
            {isStreaming && (
              <span className="ml-1 animate-pulse rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                {UI_COPY.ADVISOR.WIDGET.LIVE_BADGE}
              </span>
            )}
          </div>
          <div className="fn-insight-header-actions">
            {hasLoaded && !isStreaming && (
              <button
                onClick={refetch}
                title={UI_COPY.ADVISOR.WIDGET.REFRESH}
                className="fn-insight-header-btn"
              >
                <RefreshCw className="size-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="fn-insight-header-btn"
              aria-label={UI_COPY.ADVISOR.WIDGET.CLOSE}
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        </div>

        {/* Panel body */}
        <div className="max-h-72 overflow-y-auto px-4 py-3 text-sm">
          {isError ? (
            <p className="text-destructive text-xs">{UI_COPY.ADVISOR.WIDGET.ERROR}</p>
          ) : isStreaming && !text ? (
            <div className="text-muted-foreground flex items-center gap-2 py-4 text-xs">
              <RefreshCw className="text-primary size-3.5 animate-spin" />
              <span>{UI_COPY.ADVISOR.WIDGET.ANALYZING(pageTitle)}</span>
            </div>
          ) : text ? (
            <MarkdownContent content={text} className="text-[13px]">
              {isStreaming && (
                <span className="text-primary ml-0.5 animate-pulse font-bold">▍</span>
              )}
            </MarkdownContent>
          ) : (
            <div className="space-y-3 py-2 text-center">
              <p className="text-muted-foreground text-xs leading-relaxed">
                {UI_COPY.ADVISOR.WIDGET.READY_DESCRIPTION(pageTitle)}
              </p>
              <button onClick={handleGenerate} className="fn-insight-generate-btn">
                <Sparkles className="size-3.5 animate-pulse" />
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
              className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-xs font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ExternalLink className="size-3" />
              {UI_COPY.ADVISOR.WIDGET.ASK_IN_CHAT}
            </Link>
            <span className="text-muted-foreground text-[10px]">
              {UI_COPY.ADVISOR.WIDGET.BRAND}
            </span>
          </div>
        )}
      </div>

      {/* FAB trigger button — spacious pill with icon + title */}
      <div className="pointer-events-auto">
        <button
          onClick={handleToggle}
          aria-label={isOpen ? UI_COPY.ADVISOR.WIDGET.CLOSE : UI_COPY.ADVISOR.WIDGET.OPEN}
          aria-expanded={isOpen}
          className={cn("fn-insight-trigger", isOpen && "is-open")}
        >
          <Sparkles
            className={cn(
              "size-4 shrink-0 transition-transform duration-300",
              isOpen ? "text-primary-foreground animate-pulse" : "text-primary",
            )}
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
              <X className="size-3.5 shrink-0" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

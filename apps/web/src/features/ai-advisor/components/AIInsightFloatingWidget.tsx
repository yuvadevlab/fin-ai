"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X, RefreshCw, ExternalLink, ChevronDown } from "lucide-react";
import { cn } from "@finai/ui";
import { useAiInsight, type InsightPage } from "../api";
import { FEATURE_FLAGS } from "@/lib/app-constants";

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
  dashboard: "Dashboard Overview",
  health: "Financial Health",
  transactions: "Transactions",
  budgets: "Budgets & Spending",
  investments: "Investment Portfolio",
  goals: "Savings Goals",
  reports: "Financial Reports",
  accounts: "Linked Accounts",
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
  if (
    !FEATURE_FLAGS.AI_INSIGHT ||
    !page ||
    pathname.startsWith("/advisor") ||
    pathname.startsWith("/ai-advisor")
  ) {
    return null;
  }

  const hasLoaded = !!text || isStreaming || isError;
  const pageTitle = PAGE_TITLES[page] ?? "Financial";
  // Pure derived state: show notification dot only if insight was generated but widget is closed
  const hasNewInsight = !isOpen && !isStreaming && Boolean(text);

  const handleGenerate = () => {
    refetch();
  };

  const handleToggle = () => {
    setIsOpen((v) => !v);
  };

  return (
    <div
      className={cn(
        // Positioned bottom-20 (80px above bottom) so it NEVER obscures table pagination, footers or docked buttons
        "fixed right-4 bottom-20 z-40 flex flex-col items-end gap-2 sm:right-6",
        "pointer-events-none", // let clicks through transparent areas
      )}
    >
      {/* Expanded flyout panel — opens directly above the trigger button */}
      <div
        className={cn(
          "pointer-events-auto w-80 overflow-hidden rounded-2xl shadow-2xl ring-1 transition-all duration-300 sm:w-88",
          "bg-card/95 ring-border/70 border-primary/20 border backdrop-blur-md",
          isOpen
            ? "mb-1 max-h-115 translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 translate-y-3 opacity-0",
        )}
        aria-hidden={!isOpen}
      >
        {/* Panel header */}
        <div className="from-primary/90 to-primary flex items-center justify-between bg-linear-to-r px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 animate-pulse" />
            <div>
              <span className="text-sm font-semibold">{pageTitle}</span>
              <p className="mt-0.5 text-[10px] leading-none font-medium text-white/80">
                AI Live Analysis
              </p>
            </div>
            {isStreaming && (
              <span className="ml-1 animate-pulse rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                live
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasLoaded && !isStreaming && (
              <button
                onClick={refetch}
                title="Refresh insight"
                className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95"
              >
                <RefreshCw className="size-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95"
              aria-label="Close AI insight"
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        </div>

        {/* Panel body */}
        <div className="max-h-72 overflow-y-auto px-4 py-3 text-sm">
          {isError ? (
            <p className="text-destructive text-xs">
              Could not load insight. Make sure Ollama or AI engine is running.
            </p>
          ) : isStreaming && !text ? (
            <div className="text-muted-foreground flex items-center gap-2 py-4 text-xs">
              <RefreshCw className="text-primary size-3.5 animate-spin" />
              <span>Analyzing {pageTitle.toLowerCase()} data…</span>
            </div>
          ) : text ? (
            <p className="text-foreground/90 text-[13px] leading-relaxed">
              {text}
              {isStreaming && (
                <span className="text-primary ml-0.5 animate-pulse font-bold">▍</span>
              )}
            </p>
          ) : (
            <div className="space-y-3 py-2 text-center">
              <p className="text-muted-foreground text-xs leading-relaxed">
                Generate a real-time, personalized AI analysis grounded in your live{" "}
                {pageTitle.toLowerCase()} numbers.
              </p>
              <button
                onClick={handleGenerate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="size-3.5 animate-pulse" />
                Generate Insight
              </button>
            </div>
          )}
        </div>

        {/* Footer link to full advisor */}
        {hasLoaded && (
          <div className="border-border/60 bg-secondary/30 flex items-center justify-between border-t px-4 py-2">
            <Link
              href="/ai-advisor"
              className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-xs font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ExternalLink className="size-3" />
              Ask AI Advisor in Chat
            </Link>
            <span className="text-muted-foreground text-[10px]">FinAI Advisor</span>
          </div>
        )}
      </div>

      {/* FAB trigger button — mini icon only by default, expands on hover */}
      <div className="pointer-events-auto">
        <button
          onClick={handleToggle}
          aria-label={isOpen ? "Close AI Insight" : "Open AI Insight"}
          aria-expanded={isOpen}
          className={cn(
            "group relative flex cursor-pointer items-center shadow-xl transition-all duration-300 active:scale-95",
            "rounded-full",
            isOpen
              ? "bg-primary text-primary-foreground ring-primary/30 gap-2 px-3.5 py-2.5 ring-2"
              : "bg-card/90 text-foreground ring-border/70 hover:border-primary/40 hover:bg-card border-border/80 border p-2.5 ring-1 backdrop-blur-md hover:gap-2 hover:px-3.5",
          )}
        >
          <Sparkles
            className={cn(
              "size-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
              isOpen ? "text-primary-foreground animate-pulse" : "text-primary",
            )}
          />

          {/* Text label: hidden initially, smoothly expands on hover or stays visible when open */}
          <span
            className={cn(
              "overflow-hidden text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-300",
              isOpen
                ? "max-w-32 opacity-100"
                : "max-w-0 opacity-0 group-hover:max-w-32 group-hover:opacity-100",
            )}
          >
            {isOpen ? "Close Insight" : "AI Insight"}
          </span>

          {/* Notification dot — shown when insight is ready but panel is closed */}
          {hasNewInsight && !isOpen && (
            <span className="bg-primary ring-background absolute -top-1 -right-1 size-2.5 animate-bounce rounded-full ring-2" />
          )}

          {isOpen && <X className="size-3.5 shrink-0 opacity-70" />}
        </button>
      </div>
    </div>
  );
}

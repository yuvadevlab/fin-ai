"use client";

import { RefreshCw } from "lucide-react";
import { AIInsightCard, AISuggestionsDialog, type AISuggestion } from "@finai/ui";
import { useWorkspace } from "@/providers";
import { useAiInsight, type InsightPage } from "../api/useAiInsight";

interface LiveAIInsightCardProps {
  page: InsightPage;
  variant?: "dark" | "light";
  cta?: string;
  suggestions?: AISuggestion[];
  onCtaClick?: () => void;
  suggestionsTitle?: string;
  suggestionsDescription?: string;
}

/**
 * Drop-in replacement for the static AIInsightCard placeholders.
 * Streams a real AI insight for the given page and optionally renders
 * an AISuggestionsDialog as the CTA.
 */
export function LiveAIInsightCard({
  page,
  variant = "dark",
  cta,
  suggestions,
  onCtaClick,
  suggestionsTitle,
  suggestionsDescription,
}: LiveAIInsightCardProps) {
  const { workspaceId } = useWorkspace();
  const { text, isStreaming, isError, refetch } = useAiInsight({
    workspaceId,
    page,
    enabled: false, // Don't auto-generate on mount
  });

  const hasLoaded = !!text || isStreaming || isError;

  const body = isError ? (
    <span className="text-xs text-red-400">
      Could not load insight. Make sure Ollama is running.
    </span>
  ) : isStreaming && !text ? (
    <span className="animate-pulse text-xs opacity-60">Generating insight…</span>
  ) : text ? (
    <>
      {text}
      {isStreaming && <span className="ml-0.5 animate-pulse font-bold">▍</span>}
    </>
  ) : (
    <span className="opacity-80">
      Get a personalized, real-time AI analysis based on your budgets, goals, and accounts.
    </span>
  );

  const ctaWrapper =
    hasLoaded && suggestions && suggestions.length > 0
      ? (btn: React.ReactNode) => (
          <AISuggestionsDialog
            trigger={btn}
            title={suggestionsTitle ?? "AI Suggestions"}
            description={suggestionsDescription}
            suggestions={suggestions}
          />
        )
      : undefined;

  const handleCtaClick = hasLoaded ? onCtaClick : refetch;
  const currentCta = hasLoaded ? cta : "Generate AI Insight";

  return (
    <AIInsightCard
      variant={variant}
      body={body}
      cta={currentCta}
      onCtaClick={handleCtaClick}
      ctaWrapper={ctaWrapper}
      title={
        isStreaming ? (
          <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-emerald-400 uppercase ring-1 ring-emerald-500/20">
            ● live
          </span>
        ) : hasLoaded ? (
          <button
            onClick={refetch}
            title="Refresh insight"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 flex size-6 cursor-pointer items-center justify-center rounded-md transition-all active:scale-95"
          >
            <RefreshCw className="size-3.5" />
          </button>
        ) : undefined
      }
    />
  );
}

"use client";

import { useMemo } from "react";
import { cn } from "@finai/ui";
import { extractFinancialInsight } from "../utils/financialInsight";

interface FinancialInsightProps {
  text: string;
  className?: string;
}

/**
 * Renders assistant markdown, promoting a leading financial figure (if clearly
 * present) into a prominent card above the prose. Falls back to rendering the
 * full text unchanged when no clear insight pattern is detected.
 */
export function FinancialInsight({ text, className }: FinancialInsightProps) {
  const insight = useMemo(() => extractFinancialInsight(text), [text]);

  if (!insight) return null;

  return (
    <div className={cn("mb-3", className)}>
      <div className="bg-primary/5 border-primary/15 rounded-xl border p-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {insight.label}
        </p>
        <p className="text-foreground mt-1 text-2xl font-bold tracking-tight">{insight.value}</p>
        {insight.context && (
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">{insight.context}</p>
        )}
      </div>
    </div>
  );
}

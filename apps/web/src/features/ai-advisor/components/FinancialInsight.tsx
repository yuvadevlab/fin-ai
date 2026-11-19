"use client";

import { useMemo } from "react";
import { cn } from "@fin-ai/ui";
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
    <div className={cn("fn-financial-insight", className)}>
      <div className="fn-financial-insight-card">
        <p className="fn-financial-insight-label">{insight.label}</p>
        <p className="fn-financial-insight-value">{insight.value}</p>
        {insight.context && <p className="fn-financial-insight-context">{insight.context}</p>}
      </div>
    </div>
  );
}

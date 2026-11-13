"use client";

import React from "react";
import { ContentCard, Progress, cn } from "@finai/ui";
import { UI_COPY } from "@/lib/ui-copy";

export interface HealthMetricCardProps {
  /** Primary card title */
  title: string;
  /** Secondary context / subtitle description */
  subtitle: string;
  /** 0-100 health foundation score */
  score?: number;
  /** Enum-compatible status string (e.g. at_risk, on_track) */
  status?: string;
  /** Current measured metric value */
  current?: number;
  /** Target goal value */
  target?: number;
  /** Formatting unit (% or currency ISO) */
  unit?: string;
  /** Actionable next best recommendation */
  nextAction?: string;
  /** Optional layout or container classes */
  className?: string;
}

function scoreColor(v: number): string {
  if (v >= 80) return "text-primary";
  if (v >= 60) return "text-amber-600";
  return "text-destructive";
}

function formatMetricValue(value: number, unit: string): string {
  if (unit === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${unit === "%" ? "%" : ` ${unit}`}`;
}

function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

/**
 * Standardized card primitive for financial health metrics, strengths, and priority actions.
 * Enforces identical background, borders, typography, progress bar, and recommendation notes.
 */
export function HealthMetricCard({
  title,
  subtitle,
  score,
  status,
  current,
  target,
  unit,
  nextAction,
  className,
}: HealthMetricCardProps) {
  return (
    <ContentCard className={cn("flex flex-col justify-between p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-foreground text-sm font-bold">{title}</p>
          <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
        </div>
        {score != null && (
          <div className="text-right">
            <span className={cn("text-lg font-bold", scoreColor(score))}>{score}</span>
            {status && (
              <p className="text-muted-foreground text-[11px] capitalize">{statusLabel(status)}</p>
            )}
          </div>
        )}
      </div>

      {score != null && <Progress value={score} className="mt-3 h-1.5" />}

      {current != null && target != null && unit && (
        <div className="text-muted-foreground mt-3 flex flex-wrap justify-between gap-1 text-xs">
          <span>
            {UI_COPY.HEALTH.NOW} {formatMetricValue(current, unit)}
          </span>
          <span>
            {UI_COPY.HEALTH.TARGET} {formatMetricValue(target, unit)}
          </span>
        </div>
      )}

      {nextAction && (
        <p className="text-foreground bg-muted/40 mt-3 rounded-lg p-2.5 text-xs font-medium sm:p-3">
          {UI_COPY.HEALTH.NEXT_PREFIX} {nextAction}
        </p>
      )}
    </ContentCard>
  );
}

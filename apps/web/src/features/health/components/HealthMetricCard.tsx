"use client";

import React from "react";
import { ContentCard, Progress, cn } from "@fin-ai/ui";
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

function scoreClass(v: number): string {
  if (v >= 80) return "fn-score--high";
  if (v >= 60) return "fn-score--mid";
  return "fn-score--low";
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
    <ContentCard className={cn("fn-health-card", className)}>
      <div className="fn-health-card-header">
        <div>
          <p className="fn-health-card-title">{title}</p>
          <p className="fn-health-card-subtitle">{subtitle}</p>
        </div>
        {score != null && (
          <div className="fn-health-card-score-box">
            <span className={cn("fn-health-card-score", scoreClass(score))}>{score}</span>
            {status && <p className="fn-health-card-status">{statusLabel(status)}</p>}
          </div>
        )}
      </div>

      {score != null && <Progress value={score} className="fn-health-card-progress" />}

      {current != null && target != null && unit && (
        <div className="fn-health-card-metrics">
          <span>
            {UI_COPY.HEALTH.NOW} {formatMetricValue(current, unit)}
          </span>
          <span>
            {UI_COPY.HEALTH.TARGET} {formatMetricValue(target, unit)}
          </span>
        </div>
      )}

      {nextAction && (
        <p className="fn-health-card-action">
          {UI_COPY.HEALTH.NEXT_PREFIX} {nextAction}
        </p>
      )}
    </ContentCard>
  );
}

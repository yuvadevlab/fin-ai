"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ChartCard, ScoreGauge, Progress, cn } from "@fin-ai/ui";
import { APP_ROUTES } from "@/lib";
import { useHealthScore } from "../api/getHealthScore";
import { UI_COPY } from "@/lib/ui-copy";

function scoreClass(v: number) {
  if (v >= 80) return "fn-score--high";
  if (v >= 60) return "fn-score--mid";
  return "fn-score--low";
}

export function DashboardHealthCard() {
  const { data: healthData, isLoading } = useHealthScore();

  const score = healthData?.score ?? 0;
  const metrics = useMemo(
    () => (Array.isArray(healthData?.metrics) ? healthData!.metrics.slice(0, 3) : []),
    [healthData],
  );

  return (
    <ChartCard
      title={UI_COPY.DASHBOARD.HEALTH_CARD.TITLE}
      hint={
        <Link href={APP_ROUTES.HEALTH} className="fn-health-view-all-link">
          {UI_COPY.DASHBOARD.HEALTH_CARD.VIEW_ALL}{" "}
          <ArrowUpRight className="fn-health-view-all-icon" aria-hidden="true" />
        </Link>
      }
      className="fn-health-dashboard-card"
    >
      {isLoading ? (
        <div className="fn-health-loading-box">
          <div className="fn-health-loading-circle" />
          <div className="fn-health-loading-bar" />
        </div>
      ) : (
        <div className="fn-health-content">
          <div className="fn-health-gauge-wrap">
            <ScoreGauge
              score={score}
              size={120}
              strokeWidth={8}
              rating={healthData?.rating ?? "—"}
              showRating
            />
            <p className="fn-health-gauge-desc">{UI_COPY.DASHBOARD.HEALTH_CARD.DESCRIPTION}</p>
          </div>

          {metrics.length > 0 && (
            <div className="fn-health-metrics-list">
              {metrics.map((m) => (
                <div key={m.label} className="fn-health-metric-row">
                  <div className="fn-health-metric-header">
                    <span className="fn-health-metric-label">{m.label}</span>
                    <span className={cn("fn-font-semibold", scoreClass(m.score))}>{m.score}%</span>
                  </div>
                  <Progress value={m.score} className="fn-health-progress-bar" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}

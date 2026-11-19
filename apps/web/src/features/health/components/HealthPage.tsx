"use client";

import React, { useMemo, useState } from "react";
import { HEALTH_RATINGS } from "@fin-ai/shared-types";
import { ContentCard, InfoButton, PageContainer, PageHeader, ScoreGauge } from "@fin-ai/ui";
import { useHealthScore } from "@/features/dashboard/api/getHealthScore";
import { HealthGuideDialog } from "./HealthGuideDialog";
import { HealthMetricCard } from "./HealthMetricCard";
import { UI_COPY } from "@/lib/ui-copy";

export function HealthPage() {
  const { data: healthData } = useHealthScore();
  const [guideOpen, setGuideOpen] = useState(false);

  const score = healthData?.score ?? 0;
  const metrics = useMemo(
    () => (Array.isArray(healthData?.metrics) ? healthData!.metrics : []),
    [healthData],
  );
  const strongestMetric = [...metrics]
    .filter((metric) => metric.dataQuality === "complete")
    .sort((a, b) => b.score - a.score)[0];
  const riskMetric = [...metrics]
    .filter((metric) => metric.dataQuality === "complete")
    .sort((a, b) => a.score - b.score)[0];

  return (
    <PageContainer>
      <PageHeader
        title={
          <span className="fn-page-header-inline">
            <span>{UI_COPY.HEALTH.PAGE_TITLE}</span>
            <InfoButton
              aria-label={UI_COPY.HEALTH.GUIDE_A11Y}
              tooltip={UI_COPY.HEALTH.SCORE_TOOLTIP}
              onClick={() => setGuideOpen(true)}
            />
          </span>
        }
        description={UI_COPY.HEALTH.PAGE_DESCRIPTION_LONG}
      />

      <HealthGuideDialog open={guideOpen} onOpenChange={setGuideOpen} />

      <section className="fn-health-summary-grid">
        <ContentCard className="fn-health-score-card">
          <ScoreGauge
            score={score}
            rating={healthData?.rating ?? HEALTH_RATINGS.NEEDS_ATTENTION}
            showRating
          />
          <p className="fn-health-score-summary">
            {healthData?.summary ?? UI_COPY.HEALTH.ANALYZING}
          </p>
        </ContentCard>

        <div className="fn-health-insights-col">
          {/* Card 1: Next Best Action */}
          <HealthMetricCard
            title={UI_COPY.HEALTH.NEXT_ACTION}
            subtitle={
              riskMetric
                ? UI_COPY.HEALTH.PRIORITY_AREA(riskMetric.label)
                : (healthData?.summary ?? UI_COPY.HEALTH.PAGE_DESCRIPTION)
            }
            score={riskMetric?.score}
            status={riskMetric?.status}
            current={riskMetric?.current}
            target={riskMetric?.target}
            unit={riskMetric?.unit}
            nextAction={
              healthData?.nextBestAction ?? riskMetric?.nextAction ?? UI_COPY.HEALTH.DEFAULT_ACTION
            }
          />

          <div className="fn-health-metrics-pair">
            {/* Card 2: What is Helping */}
            <HealthMetricCard
              title={UI_COPY.HEALTH.WHAT_IS_HELPING}
              subtitle={
                healthData?.topStrength ?? strongestMetric?.note ?? strongestMetric?.label ?? "—"
              }
              score={strongestMetric?.score}
              status={strongestMetric?.status}
              current={strongestMetric?.current}
              target={strongestMetric?.target}
              unit={strongestMetric?.unit}
              nextAction={strongestMetric?.nextAction}
            />

            {/* Card 3: Main Constraint */}
            <HealthMetricCard
              title={UI_COPY.HEALTH.MAIN_CONSTRAINT}
              subtitle={healthData?.topRisk ?? riskMetric?.note ?? riskMetric?.label ?? "—"}
              score={riskMetric?.score}
              status={riskMetric?.status}
              current={riskMetric?.current}
              target={riskMetric?.target}
              unit={riskMetric?.unit}
              nextAction={riskMetric?.nextAction}
            />
          </div>
        </div>
      </section>

      <section className="fn-health-breakdown-section">
        <div>
          <h2 className="fn-health-breakdown-title">{UI_COPY.HEALTH.PAGE_TITLE}</h2>
          <p className="fn-health-breakdown-subtitle">{UI_COPY.HEALTH.PAGE_DESCRIPTION}</p>
        </div>

        <div className="fn-health-cards-grid">
          {metrics.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <ContentCard key={i} className="fn-health-card-skeleton">
                  <div className="fn-skeleton-bar" />
                  <div className="fn-skeleton-bar fn-skeleton-bar--sm" />
                </ContentCard>
              ))
            : metrics.map((m) => (
                <HealthMetricCard
                  key={m.label}
                  title={m.label}
                  subtitle={m.note}
                  score={m.score}
                  status={m.status}
                  current={m.current}
                  target={m.target}
                  unit={m.unit}
                  nextAction={m.nextAction}
                />
              ))}
        </div>
      </section>
    </PageContainer>
  );
}

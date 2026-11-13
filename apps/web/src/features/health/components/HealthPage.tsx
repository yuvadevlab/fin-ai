"use client";

import React, { useMemo, useState } from "react";
import { HEALTH_RATINGS } from "@finai/shared-types";
import { ContentCard, InfoButton, PageContainer, PageHeader, ScoreGauge } from "@finai/ui";
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
          <span className="inline-flex items-center gap-2">
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

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard className="flex flex-col items-center justify-center p-5 text-center sm:p-8">
          <ScoreGauge
            score={score}
            rating={healthData?.rating ?? HEALTH_RATINGS.NEEDS_ATTENTION}
            showRating
          />
          <p className="text-foreground mt-4 max-w-sm text-sm font-medium">
            {healthData?.summary ?? UI_COPY.HEALTH.ANALYZING}
          </p>
        </ContentCard>

        <div className="grid gap-4 lg:col-span-2 lg:h-full">
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

          <div className="grid gap-4 sm:grid-cols-2">
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

      <section className="mt-6 space-y-4">
        <div>
          <h2 className="text-foreground text-lg font-bold">{UI_COPY.HEALTH.PAGE_TITLE}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{UI_COPY.HEALTH.PAGE_DESCRIPTION}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {metrics.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <ContentCard key={i} className="animate-pulse p-5">
                  <div className="bg-muted h-4 w-1/3 rounded" />
                  <div className="bg-muted mt-2 h-2 w-full rounded" />
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

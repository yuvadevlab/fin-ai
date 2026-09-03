"use client";

import React, { useMemo } from "react";
import { PageContainer, PageHeader, ContentCard, Progress, ScoreGauge, cn } from "@finai/ui";
import { useHealthScore } from "@/features/dashboard/api/getHealthScore";

function scoreColor(v: number) {
  if (v >= 80) return "text-primary";
  if (v >= 60) return "text-amber-600";
  return "text-destructive";
}

const RATING_LABEL: Record<string, string> = {
  Excellent: "Excellent standing",
  Good: "Good standing",
  Fair: "Fair standing",
  "Needs Attention": "Needs attention",
};

export function HealthPage() {
  const { data: healthData } = useHealthScore();

  const score = healthData?.score ?? 0;
  const metrics = useMemo(
    () => (Array.isArray(healthData?.metrics) ? healthData!.metrics : []),
    [healthData],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Financial Health"
        description="A composite score of your spending, savings, investment, and safety-net habits."
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard className="flex flex-col items-center justify-center p-8 text-center">
          <ScoreGauge
            score={score}
            rating={RATING_LABEL[healthData?.rating ?? ""] ?? "—"}
            showRating
          />
          <p className="text-muted-foreground mt-2 text-xs">Based on your live financial data</p>
        </ContentCard>

        <div className="space-y-4 lg:col-span-2">
          {metrics.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <ContentCard key={i} className="animate-pulse p-5">
                  <div className="bg-muted h-4 w-1/3 rounded" />
                  <div className="bg-muted mt-2 h-2 w-full rounded" />
                </ContentCard>
              ))
            : metrics.map((m) => (
                <ContentCard key={m.label} className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground text-sm font-bold">{m.label}</p>
                      <p className="text-muted-foreground text-xs">{m.note}</p>
                    </div>
                    <span className={cn("text-lg font-bold", scoreColor(m.score))}>{m.score}</span>
                  </div>
                  <Progress value={m.score} className="mt-3 h-1.5" />
                </ContentCard>
              ))}
        </div>
      </section>
    </PageContainer>
  );
}

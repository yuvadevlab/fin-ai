"use client";

import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { HEALTH_RATINGS } from "@finai/shared-types";
import {
  Button,
  ContentCard,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  PageContainer,
  PageHeader,
  Progress,
  ScoreGauge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from "@finai/ui";
import { useHealthScore } from "@/features/dashboard/api/getHealthScore";
import { HEALTH_GUIDE } from "../constants/healthGuide";

function scoreColor(v: number) {
  if (v >= 80) return "text-primary";
  if (v >= 60) return "text-amber-600";
  return "text-destructive";
}

function formatMetricValue(value: number, unit: string) {
  if (unit === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${unit === "%" ? "%" : ` ${unit}`}`;
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

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
        title="Financial Health"
        description="Understand what is working, what is limiting you, and the next move that improves your financial life."
        actions={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn("size-10")}
                  aria-label="Learn how your financial health score is calculated"
                  onClick={() => setGuideOpen(true)}
                >
                  <Info aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>How this score works</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      />

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>How your financial health score works</DialogTitle>
            <DialogDescription>
              Your score is a guide to your financial resilience, not a judgement. We compare your
              habits with practical targets and point to the next improvement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
            {HEALTH_GUIDE.map((item) => (
              <div key={item.label} className="border-border bg-card rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-foreground text-sm font-bold">{item.label}</p>
                  <span className="text-primary shrink-0 text-right text-xs font-semibold">
                    {item.target}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs leading-5">{item.explanation}</p>
                <p className="text-muted-foreground border-border mt-2 border-t pt-2 text-xs leading-5">
                  <span className="text-foreground font-semibold">What counts:</span> {item.counts}
                </p>
                <p className="text-foreground bg-muted/40 mt-2 rounded-md p-2 text-xs">
                  <span className="font-semibold">Improve it:</span> {item.improvement}
                </p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs leading-5">
            A very low emergency fund, high debt pressure, or negative monthly cash flow can limit
            the overall score even when another metric is strong. This keeps serious risks visible.
          </p>
        </DialogContent>
      </Dialog>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard className="flex flex-col items-center justify-center p-8 text-center">
          <ScoreGauge
            score={score}
            rating={healthData?.rating ?? HEALTH_RATINGS.NEEDS_ATTENTION}
            showRating
          />
          <p className="text-foreground mt-4 max-w-sm text-sm font-medium">
            {healthData?.summary ?? "Analyzing your financial foundations..."}
          </p>
        </ContentCard>

        <div className="grid gap-4 lg:col-span-2 lg:h-full lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <ContentCard className="border-primary/20 bg-primary/5 p-5 lg:flex lg:h-full lg:flex-col lg:justify-center">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Next best action
            </p>
            <p className="text-foreground mt-2 text-lg font-bold">
              {healthData?.nextBestAction ??
                "Add a few transactions to receive a personalized action."}
            </p>
            {riskMetric && (
              <div className="border-primary/20 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">Priority area: {riskMetric.label}</span>
                <span className="text-foreground font-bold">{riskMetric.score}/100</span>
              </div>
            )}
          </ContentCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:h-full">
            <ContentCard className="p-5 lg:flex lg:h-full lg:flex-col lg:justify-center">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                What is helping
              </p>
              <p className="text-foreground mt-2 text-sm">{healthData?.topStrength ?? "—"}</p>
              {strongestMetric && (
                <>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{strongestMetric.label}</span>
                    <span className={cn("font-bold", scoreColor(strongestMetric.score))}>
                      {strongestMetric.score}/100
                    </span>
                  </div>
                  <Progress value={strongestMetric.score} className="mt-2 h-1.5" />
                  <p className="text-muted-foreground mt-2 text-xs">
                    Now {formatMetricValue(strongestMetric.current, strongestMetric.unit)} · target{" "}
                    {formatMetricValue(strongestMetric.target, strongestMetric.unit)}
                  </p>
                </>
              )}
            </ContentCard>
            <ContentCard className="p-5 lg:flex lg:h-full lg:flex-col lg:justify-center">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Main constraint
              </p>
              <p className="text-foreground mt-2 text-sm">{healthData?.topRisk ?? "—"}</p>
              {riskMetric && (
                <>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{riskMetric.label}</span>
                    <span className={cn("font-bold", scoreColor(riskMetric.score))}>
                      {riskMetric.score}/100
                    </span>
                  </div>
                  <Progress value={riskMetric.score} className="mt-2 h-1.5" />
                  <p className="text-muted-foreground mt-2 text-xs">
                    Now {formatMetricValue(riskMetric.current, riskMetric.unit)} · target{" "}
                    {formatMetricValue(riskMetric.target, riskMetric.unit)}
                  </p>
                  <p className="text-foreground mt-3 text-xs font-medium">
                    Next: {riskMetric.nextAction}
                  </p>
                </>
              )}
            </ContentCard>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        <div>
          <h2 className="text-foreground text-lg font-bold">Your financial foundations</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Each metric has a target and a practical next step.
          </p>
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
                <ContentCard key={m.label} className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground text-sm font-bold">{m.label}</p>
                      <p className="text-muted-foreground mt-1 text-xs">{m.note}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn("text-lg font-bold", scoreColor(m.score))}>
                        {m.score}
                      </span>
                      <p className="text-muted-foreground text-[11px] capitalize">
                        {statusLabel(m.status)}
                      </p>
                    </div>
                  </div>
                  <Progress value={m.score} className="mt-3 h-1.5" />
                  <div className="text-muted-foreground mt-3 flex justify-between text-xs">
                    <span>Now: {formatMetricValue(m.current, m.unit)}</span>
                    <span>Target: {formatMetricValue(m.target, m.unit)}</span>
                  </div>
                  <p className="text-foreground bg-muted/40 mt-3 rounded-lg p-3 text-xs font-medium">
                    Next: {m.nextAction}
                  </p>
                </ContentCard>
              ))}
        </div>
      </section>
    </PageContainer>
  );
}

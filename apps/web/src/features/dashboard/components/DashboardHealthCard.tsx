"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ChartCard, ScoreGauge, Progress, cn } from "@finai/ui";
import { useHealthScore } from "../api/getHealthScore";

function scoreColor(v: number) {
  if (v >= 80) return "text-primary";
  if (v >= 60) return "text-amber-500";
  return "text-destructive";
}

const RATING_LABEL: Record<string, string> = {
  "Strong foundation": "Strong foundation",
  "Building stability": "Building stability",
  "Needs a plan": "Needs a plan",
  "Needs attention": "Needs attention",
};

export function DashboardHealthCard() {
  const { data: healthData, isLoading } = useHealthScore();

  const score = healthData?.score ?? 0;
  const metrics = useMemo(
    () => (Array.isArray(healthData?.metrics) ? healthData!.metrics.slice(0, 3) : []),
    [healthData],
  );

  return (
    <ChartCard
      title="Financial Health"
      hint={
        <Link
          href="/health"
          className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-xs font-semibold"
        >
          View all <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      }
      className="flex h-full flex-col justify-between p-5"
    >
      {isLoading ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3">
          <div className="bg-muted size-28 animate-pulse rounded-full" />
          <div className="bg-muted h-3 w-24 rounded" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center pt-1 text-center">
            <ScoreGauge
              score={score}
              size={120}
              strokeWidth={8}
              rating={RATING_LABEL[healthData?.rating ?? ""] ?? "—"}
              showRating
            />
            <p className="text-muted-foreground mt-1 text-[11px]">
              Based on your cash flow, safety net, debt & goals
            </p>
          </div>

          {metrics.length > 0 && (
            <div className="border-border/60 space-y-2.5 border-t pt-3">
              {metrics.map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate font-medium">{m.label}</span>
                    <span className={cn("font-semibold", scoreColor(m.score))}>{m.score}%</span>
                  </div>
                  <Progress value={m.score} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}

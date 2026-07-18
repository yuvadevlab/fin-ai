"use client";

import React, { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageContainer, PageHeader, DashboardTabs, ContentCard, Progress, cn } from "@finai/ui";
import { useHealthScore } from "@/features/dashboard/api/getHealthScore";
import { useWorkspace } from "@/providers";

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
  const pathname = usePathname();
  const { workspaceId } = useWorkspace();
  const { data: healthData } = useHealthScore(workspaceId);

  const score = healthData?.score ?? 0;
  const metrics = useMemo(
    () => (Array.isArray(healthData?.metrics) ? healthData!.metrics : []),
    [healthData],
  );

  const customLink = useCallback(
    ({
      href,
      children,
      className,
    }: {
      href: string;
      children: React.ReactNode;
      className?: string;
    }) => (
      <Link href={href} className={className}>
        {children}
      </Link>
    ),
    [],
  );

  // SVG arc circumference for r=52
  const CIRCUMFERENCE = 326.7;

  return (
    <PageContainer>
      <PageHeader
        title="Financial Health"
        description="A composite score of your spending, savings, investment, and safety-net habits."
      />

      <DashboardTabs pathname={pathname} LinkComponent={customLink} />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard className="flex flex-col items-center justify-center p-8 text-center">
          <div className="relative">
            <svg viewBox="0 0 120 120" className="size-40 -rotate-90">
              <circle cx="60" cy="60" r="52" stroke="var(--border)" strokeWidth="10" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="oklch(0.63 0.14 156)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                style={{ transition: "stroke-dasharray 0.8s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-foreground text-4xl font-bold tracking-tight">{score}</span>
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                out of 100
              </span>
            </div>
          </div>
          <p className="text-primary mt-6 text-sm font-bold">
            {RATING_LABEL[healthData?.rating ?? ""] ?? "—"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Based on your live financial data</p>
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

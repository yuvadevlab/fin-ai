"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, Target, ShieldCheck } from "lucide-react";
import { ContentCard, Progress, StatusBadge } from "@finai/ui";
import { PrivacyMoney } from "@/components";
import { APP_ROUTES } from "@/lib";
import { useInvestments } from "@/features/investments/api/getInvestments";
import { useBudgets } from "@/features/budgets/api/getBudgets";
import { useGoals } from "@/features/goals/api/getGoals";
import { calculateAggregateBudget, calculateAggregateGoals } from "@finai/finance-engine";
import type { DashboardStats } from "../api";
import { UI_COPY } from "@/lib/ui-copy";

export interface DashboardSummaryStatsProps {
  stats?: DashboardStats;
}

export function DashboardSummaryStats({ stats }: DashboardSummaryStatsProps) {
  const { data: investmentsData } = useInvestments();
  const { data: budgetsData } = useBudgets();
  const { data: goalsData } = useGoals();

  const portfolioValue = investmentsData?.totalValue ?? 0;
  const investmentsCount = investmentsData?.investments?.length ?? 0;

  const totalInvested = useMemo(
    () => (investmentsData?.investments ?? []).reduce((sum, i) => sum + (i.investedAmount ?? 0), 0),
    [investmentsData],
  );

  const totalReturns = portfolioValue - totalInvested;
  const returnPercentage =
    totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : "0.0";

  // Delegate all financial aggregations directly to pure functions in @finai/finance-engine
  const budgetSummary = useMemo(
    () => calculateAggregateBudget(Array.isArray(budgetsData) ? budgetsData : []),
    [budgetsData],
  );

  const goalsSummary = useMemo(
    () => calculateAggregateGoals(Array.isArray(goalsData) ? goalsData : []),
    [goalsData],
  );

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* 1. Investment Portfolio Pillar */}
      <ContentCard className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <TrendingUp className="size-4" />
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold">
                  {UI_COPY.DASHBOARD.PORTFOLIO.TITLE}
                </p>
                <p suppressHydrationWarning className="text-muted-foreground text-[10px]">
                  {UI_COPY.DASHBOARD.PORTFOLIO.ACTIVE_HOLDINGS(investmentsCount)}
                </p>
              </div>
            </div>
            <Link
              href={APP_ROUTES.INVESTMENTS}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-xs font-semibold"
            >
              {UI_COPY.DASHBOARD.PORTFOLIO.VIEW_ALL} <ArrowUpRight className="size-3" />
            </Link>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight">
              <PrivacyMoney value={portfolioValue} />
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {UI_COPY.DASHBOARD.PORTFOLIO.INVESTED_PREFIX} <PrivacyMoney value={totalInvested} /> ·{" "}
              {investmentsCount} {UI_COPY.DASHBOARD.PORTFOLIO.HOLDINGS}
            </p>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-2.5 text-xs">
          <span>{UI_COPY.DASHBOARD.PORTFOLIO.TOTAL_RETURNS}</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              totalReturns >= 0 ? "text-primary" : "text-destructive"
            }`}
          >
            {totalReturns >= 0 ? "+" : ""}
            <PrivacyMoney value={totalReturns} />
            <span className="text-[11px] font-normal">
              ({totalReturns >= 0 ? "+" : ""}
              {returnPercentage}%)
            </span>
          </span>
        </div>
      </ContentCard>

      {/* 2. Monthly Budget Discipline Pillar */}
      <ContentCard className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold">
                  {UI_COPY.DASHBOARD.BUDGET.TITLE}
                </p>
                <p suppressHydrationWarning className="text-muted-foreground text-[10px]">
                  {UI_COPY.DASHBOARD.BUDGET.CAP_UTILIZED(budgetSummary.usagePercentage)}
                </p>
              </div>
            </div>
            <Link
              href={APP_ROUTES.BUDGETS}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-xs font-semibold"
            >
              {UI_COPY.DASHBOARD.BUDGET.MANAGE} <ArrowUpRight className="size-3" />
            </Link>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold tracking-tight">
                <PrivacyMoney value={budgetSummary.totalSpent} />
              </p>
              <span className="text-muted-foreground text-xs">
                {UI_COPY.DASHBOARD.BUDGET.OF} <PrivacyMoney value={budgetSummary.totalLimit} />
              </span>
            </div>
            <Progress
              value={budgetSummary.usagePercentage}
              className={`mt-2 h-1.5 ${budgetSummary.usagePercentage > 100 ? "[&>div]:bg-destructive" : budgetSummary.usagePercentage > 85 ? "[&>div]:bg-amber-500" : ""}`}
            />
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-2.5 text-xs">
          <span>{UI_COPY.DASHBOARD.BUDGET.STATUS}</span>
          <StatusBadge status={budgetSummary.status} />
        </div>
      </ContentCard>

      {/* 3. Savings Goals Progress Pillar */}
      <ContentCard className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Target className="size-4" />
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold">
                  {UI_COPY.DASHBOARD.GOALS.TITLE}
                </p>
                <p suppressHydrationWarning className="text-muted-foreground text-[10px]">
                  {UI_COPY.DASHBOARD.GOALS.TARGETS_TRACKING(stats?.goalCount ?? 0)}
                </p>
              </div>
            </div>
            <Link
              href={APP_ROUTES.GOALS}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-xs font-semibold"
            >
              {UI_COPY.DASHBOARD.GOALS.VIEW_GOALS} <ArrowUpRight className="size-3" />
            </Link>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold tracking-tight">
                <PrivacyMoney value={goalsSummary.totalCurrent} />
              </p>
              <span className="text-primary text-xs font-semibold">
                {goalsSummary.progressPercentage}% {UI_COPY.DASHBOARD.GOALS.FUNDED}
              </span>
            </div>
            <Progress value={goalsSummary.progressPercentage} className="mt-2 h-1.5" />
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-2.5 text-xs">
          <span>{UI_COPY.DASHBOARD.GOALS.TARGET_TOTAL}</span>
          <span className="text-foreground font-semibold">
            <PrivacyMoney value={goalsSummary.totalTarget} />
          </span>
        </div>
      </ContentCard>
    </section>
  );
}

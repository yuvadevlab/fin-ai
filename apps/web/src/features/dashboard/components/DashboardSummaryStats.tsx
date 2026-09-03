"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, Target, ShieldCheck } from "lucide-react";
import { ContentCard, Progress, StatusBadge } from "@finai/ui";
import { PrivacyMoney } from "@/components";
import { useInvestments } from "@/features/investments/api/getInvestments";
import { useBudgets } from "@/features/budgets/api/getBudgets";
import { useGoals } from "@/features/goals/api/getGoals";
import { calculateAggregateBudget, calculateAggregateGoals } from "@finai/finance-engine";
import type { DashboardStats } from "../api";

export interface DashboardSummaryStatsProps {
  stats?: DashboardStats;
}

export function DashboardSummaryStats({ stats }: DashboardSummaryStatsProps) {
  const { data: investmentsData } = useInvestments();
  const { data: budgetsData } = useBudgets();
  const { data: goalsData } = useGoals();

  const portfolioValue = investmentsData?.totalValue ?? 0;
  const investmentsCount = investmentsData?.investments?.length ?? 0;

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
                <p className="text-foreground text-xs font-semibold">Invested Portfolio</p>
                <p className="text-muted-foreground text-[10px]">
                  {investmentsCount} active holdings
                </p>
              </div>
            </div>
            <Link
              href="/investments"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-xs font-semibold"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight">
              <PrivacyMoney value={portfolioValue} />
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Mutual funds, stocks, gold & deposits
            </p>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-2.5 text-xs">
          <span>Net Cash Flow</span>
          <span className="text-foreground font-semibold">
            <PrivacyMoney value={stats?.netCashFlow ?? 0} />
          </span>
        </div>
      </ContentCard>

      {/* 2. Monthly Budget Discipline Pillar */}
      <ContentCard className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold">Budget Guardrail</p>
                <p className="text-muted-foreground text-[10px]">
                  {budgetSummary.usagePercentage}% cap utilized
                </p>
              </div>
            </div>
            <Link
              href="/budgets"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-xs font-semibold"
            >
              Manage <ArrowUpRight className="size-3" />
            </Link>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold tracking-tight">
                <PrivacyMoney value={budgetSummary.totalSpent} />
              </p>
              <span className="text-muted-foreground text-xs">
                of <PrivacyMoney value={budgetSummary.totalLimit} />
              </span>
            </div>
            <Progress
              value={budgetSummary.usagePercentage}
              className={`mt-2 h-1.5 ${budgetSummary.usagePercentage > 100 ? "[&>div]:bg-destructive" : budgetSummary.usagePercentage > 85 ? "[&>div]:bg-amber-500" : ""}`}
            />
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-2.5 text-xs">
          <span>Status</span>
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
                <p className="text-foreground text-xs font-semibold">Savings Goals</p>
                <p className="text-muted-foreground text-[10px]">
                  {stats?.goalCount ?? 0} targets tracking
                </p>
              </div>
            </div>
            <Link
              href="/goals"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-xs font-semibold"
            >
              View goals <ArrowUpRight className="size-3" />
            </Link>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold tracking-tight">
                <PrivacyMoney value={goalsSummary.totalCurrent} />
              </p>
              <span className="text-primary text-xs font-semibold">
                {goalsSummary.progressPercentage}% funded
              </span>
            </div>
            <Progress value={goalsSummary.progressPercentage} className="mt-2 h-1.5" />
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-2.5 text-xs">
          <span>Target Total</span>
          <span className="text-foreground font-semibold">
            <PrivacyMoney value={goalsSummary.totalTarget} />
          </span>
        </div>
      </ContentCard>
    </section>
  );
}

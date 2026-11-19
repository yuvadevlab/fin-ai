"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, Target, ShieldCheck } from "lucide-react";
import { ContentCard, Progress, StatusBadge } from "@fin-ai/ui";
import { PrivacyMoney } from "@/components";
import { APP_ROUTES } from "@/lib";
import { useInvestments } from "@/features/investments/api/getInvestments";
import { useBudgets } from "@/features/budgets/api/getBudgets";
import { useGoals } from "@/features/goals/api/getGoals";
import { calculateAggregateBudget, calculateAggregateGoals } from "@fin-ai/finance-engine";
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

  // Delegate all financial aggregations directly to pure functions in @fin-ai/finance-engine
  const budgetSummary = useMemo(
    () => calculateAggregateBudget(Array.isArray(budgetsData) ? budgetsData : []),
    [budgetsData],
  );

  const goalsSummary = useMemo(
    () => calculateAggregateGoals(Array.isArray(goalsData) ? goalsData : []),
    [goalsData],
  );

  return (
    <section className="fn-dashboard-summary-grid">
      {/* 1. Investment Portfolio Pillar */}
      <ContentCard className="fn-summary-stat-card">
        <div>
          <div className="fn-summary-stat-header">
            <div className="fn-stat-pillar-info">
              <div className="fn-summary-stat-icon">
                <TrendingUp className="fn-notifications-action-icon" />
              </div>
              <div>
                <p className="fn-stat-pillar-title">{UI_COPY.DASHBOARD.PORTFOLIO.TITLE}</p>
                <p suppressHydrationWarning className="fn-stat-pillar-sub">
                  {UI_COPY.DASHBOARD.PORTFOLIO.ACTIVE_HOLDINGS(investmentsCount)}
                </p>
              </div>
            </div>
            <Link href={APP_ROUTES.INVESTMENTS} className="fn-category-view-all-link">
              {UI_COPY.DASHBOARD.PORTFOLIO.VIEW_ALL}{" "}
              <ArrowUpRight className="fn-category-view-all-icon" />
            </Link>
          </div>

          <div className="fn-summary-stat-body">
            <p className="fn-summary-stat-value">
              <PrivacyMoney value={portfolioValue} />
            </p>
            <p className="fn-stat-pillar-invested">
              {UI_COPY.DASHBOARD.PORTFOLIO.INVESTED_PREFIX} <PrivacyMoney value={totalInvested} /> ·{" "}
              {investmentsCount} {UI_COPY.DASHBOARD.PORTFOLIO.HOLDINGS}
            </p>
          </div>
        </div>

        <div className="fn-summary-stat-footer">
          <span>{UI_COPY.DASHBOARD.PORTFOLIO.TOTAL_RETURNS}</span>
          <span
            className={`fn-stat-pillar-return ${
              totalReturns >= 0 ? "fn-score--high" : "fn-score--low"
            }`}
          >
            {totalReturns >= 0 ? "+" : ""}
            <PrivacyMoney value={totalReturns} />
            <span className="fn-stat-pillar-pct">
              ({totalReturns >= 0 ? "+" : ""}
              {returnPercentage}%)
            </span>
          </span>
        </div>
      </ContentCard>

      {/* 2. Monthly Budget Discipline Pillar */}
      <ContentCard className="fn-summary-stat-card">
        <div>
          <div className="fn-summary-stat-header">
            <div className="fn-stat-pillar-info">
              <div className="fn-summary-stat-icon">
                <ShieldCheck className="fn-notifications-action-icon" />
              </div>
              <div>
                <p className="fn-stat-pillar-title">{UI_COPY.DASHBOARD.BUDGET.TITLE}</p>
                <p suppressHydrationWarning className="fn-stat-pillar-sub">
                  {UI_COPY.DASHBOARD.BUDGET.CAP_UTILIZED(budgetSummary.usagePercentage)}
                </p>
              </div>
            </div>
            <Link href={APP_ROUTES.BUDGETS} className="fn-category-view-all-link">
              {UI_COPY.DASHBOARD.BUDGET.MANAGE}{" "}
              <ArrowUpRight className="fn-category-view-all-icon" />
            </Link>
          </div>

          <div className="fn-summary-stat-body">
            <div className="fn-stat-pillar-baseline">
              <p className="fn-summary-stat-value">
                <PrivacyMoney value={budgetSummary.totalSpent} />
              </p>
              <span className="fn-stat-pillar-limit">
                {UI_COPY.DASHBOARD.BUDGET.OF} <PrivacyMoney value={budgetSummary.totalLimit} />
              </span>
            </div>
            <Progress value={budgetSummary.usagePercentage} className="fn-health-progress-bar" />
          </div>
        </div>

        <div className="fn-summary-stat-footer">
          <span>{UI_COPY.DASHBOARD.BUDGET.STATUS}</span>
          <StatusBadge status={budgetSummary.status} />
        </div>
      </ContentCard>

      {/* 3. Savings Goals Progress Pillar */}
      <ContentCard className="fn-summary-stat-card">
        <div>
          <div className="fn-summary-stat-header">
            <div className="fn-stat-pillar-info">
              <div className="fn-summary-stat-icon fn-summary-stat-icon--alt">
                <Target className="fn-notifications-action-icon" />
              </div>
              <div>
                <p className="fn-stat-pillar-title">{UI_COPY.DASHBOARD.GOALS.TITLE}</p>
                <p suppressHydrationWarning className="fn-stat-pillar-sub">
                  {UI_COPY.DASHBOARD.GOALS.TARGETS_TRACKING(stats?.goalCount ?? 0)}
                </p>
              </div>
            </div>
            <Link href={APP_ROUTES.GOALS} className="fn-category-view-all-link">
              {UI_COPY.DASHBOARD.GOALS.VIEW_GOALS}{" "}
              <ArrowUpRight className="fn-category-view-all-icon" />
            </Link>
          </div>

          <div className="fn-summary-stat-body">
            <div className="fn-stat-pillar-baseline">
              <p className="fn-summary-stat-value">
                <PrivacyMoney value={goalsSummary.totalCurrent} />
              </p>
              <span className="fn-stat-pillar-funded">
                {goalsSummary.progressPercentage}% {UI_COPY.DASHBOARD.GOALS.FUNDED}
              </span>
            </div>
            <Progress value={goalsSummary.progressPercentage} className="fn-health-progress-bar" />
          </div>
        </div>

        <div className="fn-summary-stat-footer">
          <span>{UI_COPY.DASHBOARD.GOALS.TARGET_TOTAL}</span>
          <span className="fn-font-semibold">
            <PrivacyMoney value={goalsSummary.totalTarget} />
          </span>
        </div>
      </ContentCard>
    </section>
  );
}

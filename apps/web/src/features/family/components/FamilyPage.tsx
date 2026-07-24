"use client";

import React, { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PageContainer,
  PageHeader,
  DashboardTabs,
  KPIGrid,
  StatCard,
  ContentCard,
  SectionHeader,
  MoneyDisplay,
  CashFlowChart,
  CategoryPie,
  TrendLine,
  CHART_COLORS,
} from "@finai/ui";
import { LiveAIInsightCard } from "@/features/ai-advisor/components";
import { useDashboardStats } from "@/features/dashboard/api/getDashboardStats";
import { useMonthlyAnalytics } from "@/features/dashboard/api/getMonthlyAnalytics";
import { useCategoryBreakdown } from "@/features/dashboard/api/getCategoryBreakdown";
import { useSavingsTrend } from "@/features/dashboard/api/getSavingsTrend";
import { useWorkspace } from "@/providers";
import { FEATURE_FLAGS } from "@/lib/app-constants";
import { PendingInvitesList } from "./PendingInvitesList";
import { FamilyMembersSection } from "./FamilyMembersSection";

export function FamilyPage() {
  const pathname = usePathname();
  const { workspaceId } = useWorkspace();

  const { data: stats } = useDashboardStats(workspaceId);
  const { data: rawMonthlyCashFlow } = useMonthlyAnalytics(workspaceId);
  const { data: rawCategoryBreakdown } = useCategoryBreakdown(workspaceId);
  const { data: rawSavingsTrend } = useSavingsTrend(workspaceId);

  const monthlyCashFlow = useMemo(
    () => (Array.isArray(rawMonthlyCashFlow) ? rawMonthlyCashFlow : []),
    [rawMonthlyCashFlow],
  );

  const categoryBreakdown = useMemo(
    () => (Array.isArray(rawCategoryBreakdown) ? rawCategoryBreakdown : []),
    [rawCategoryBreakdown],
  );

  const savingsTrend = useMemo(
    () => (Array.isArray(rawSavingsTrend) ? rawSavingsTrend : []),
    [rawSavingsTrend],
  );

  // Shared budget usage — ratio of expenses to income (as %)
  const sharedBudgetPct = useMemo(() => {
    const income = stats?.monthlyIncome ?? 0;
    const expenses = stats?.monthlyExpenses ?? 0;
    if (income <= 0) return 0;
    return Math.min(100, Math.round((expenses / income) * 100));
  }, [stats]);

  const netSaved = (stats?.monthlyIncome ?? 0) - (stats?.monthlyExpenses ?? 0);

  const incomeChange =
    stats && stats.lastMonthIncome > 0
      ? (((stats.monthlyIncome - stats.lastMonthIncome) / stats.lastMonthIncome) * 100).toFixed(1)
      : null;

  const expenseChange =
    stats && stats.lastMonthExpenses > 0
      ? (
          ((stats.monthlyExpenses - stats.lastMonthExpenses) / stats.lastMonthExpenses) *
          100
        ).toFixed(1)
      : null;

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

  return (
    <PageContainer>
      <PageHeader
        title="Family Finance"
        description="Shared spending, bills, and goals across your family workspace."
      />

      <DashboardTabs pathname={pathname} LinkComponent={customLink} />

      <PendingInvitesList />

      <KPIGrid>
        <StatCard
          label="Combined Income"
          value={<MoneyDisplay value={stats?.monthlyIncome ?? 0} />}
          trend={
            incomeChange !== null
              ? {
                  value: `${Number(incomeChange) >= 0 ? "+" : ""}${incomeChange}%`,
                  kind: Number(incomeChange) >= 0 ? "up" : "down",
                }
              : undefined
          }
        />
        <StatCard
          label="Combined Expenses"
          value={<MoneyDisplay value={stats?.monthlyExpenses ?? 0} />}
          trend={
            expenseChange !== null
              ? {
                  value: `${Number(expenseChange) >= 0 ? "+" : ""}${expenseChange}%`,
                  kind: Number(expenseChange) > 0 ? "down" : "up",
                }
              : undefined
          }
          hint="vs last month"
        />
        <StatCard
          label="Family Savings"
          value={<MoneyDisplay value={netSaved} />}
          trend={{
            value: `${stats?.savingsRate?.toFixed(1) ?? 0}% savings rate`,
            kind: (stats?.savingsRate ?? 0) > 30 ? "up" : "flat",
          }}
        />
        <StatCard
          label="Shared Budget"
          value={`${sharedBudgetPct}%`}
          hint="of monthly income spent"
        >
          <div className="bg-border/60 ml-auto h-1 w-24 overflow-hidden rounded-full">
            <div className="bg-primary h-full" style={{ width: `${sharedBudgetPct}%` }} />
          </div>
        </StatCard>
      </KPIGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ContentCard>
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader title="Family Cash Flow" className="mb-0" />
              <span className="text-muted-foreground text-xs">Last 6 months</span>
            </div>
            <CashFlowChart data={monthlyCashFlow} />
          </ContentCard>

          <ContentCard>
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader title="Family Savings Trend" className="mb-0" />
              <span className="text-muted-foreground text-xs">Monthly net savings</span>
            </div>
            <TrendLine data={savingsTrend} />
          </ContentCard>

          {workspaceId && <FamilyMembersSection workspaceId={workspaceId} />}
        </div>

        <div className="space-y-6">
          {FEATURE_FLAGS.AI_INSIGHT && (
            <LiveAIInsightCard page="family" variant="light" cta="View Family Goals" />
          )}

          <ContentCard>
            <SectionHeader title="Shared Category Spending" />
            <CategoryPie data={categoryBreakdown.map((c) => ({ name: c.name, value: c.total }))} />
            <ul className="mt-4 space-y-2 text-sm">
              {categoryBreakdown.slice(0, 4).map((c, i) => (
                <li key={c.categoryId ?? c.name} className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <span
                      className="size-2 animate-pulse rounded-full"
                      style={{
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    {c.name}
                  </span>
                  <span className="font-semibold">
                    <MoneyDisplay value={c.total} />
                  </span>
                </li>
              ))}
            </ul>
          </ContentCard>

          {/* Net Worth mini card */}
          <ContentCard>
            <SectionHeader title="Family Net Worth" />
            <div className="mt-2">
              <p className="text-foreground text-2xl font-bold">
                <MoneyDisplay value={stats?.netWorth ?? 0} />
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {stats?.accountCount ?? 0} accounts + investments
              </p>
            </div>
          </ContentCard>
        </div>
      </div>
    </PageContainer>
  );
}

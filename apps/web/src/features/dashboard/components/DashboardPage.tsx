"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  DashboardTabs,
  ChartCard,
  Button,
  CashFlowChart,
  ExpenseBarChart,
  TrendLine,
} from "@finai/ui";
import { TransactionDialog } from "@/features/transactions/components";
import { useCategoryBreakdown, useDashboardStats, useMonthlyAnalytics } from "../api";
import { FEATURE_FLAGS } from "@/lib/app-constants";
import { LiveAIInsightCard } from "@/features/ai-advisor/components";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { DashboardCategoryCard } from "./DashboardCategoryCard";
import { DashboardSummaryStats } from "./DashboardSummaryStats";

function CustomLinkComponent({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function DashboardPage() {
  const pathname = usePathname();

  const { data: stats } = useDashboardStats();
  const { data: rawMonthlyCashFlow } = useMonthlyAnalytics();
  const { data: rawCategoryBreakdown } = useCategoryBreakdown();

  // Guard against non-array API responses during hydration
  const monthlyCashFlow = useMemo(
    () => (Array.isArray(rawMonthlyCashFlow) ? rawMonthlyCashFlow : []),
    [rawMonthlyCashFlow],
  );

  const categoryBreakdown = useMemo(
    () => (Array.isArray(rawCategoryBreakdown) ? rawCategoryBreakdown : []),
    [rawCategoryBreakdown],
  );

  const expenseData = useMemo(
    () => monthlyCashFlow.map((m) => ({ month: m.month, expense: m.expense })),
    [monthlyCashFlow],
  );

  const savingsTrend = useMemo(
    () =>
      monthlyCashFlow.map((m) => ({
        month: m.month,
        value: Math.max(0, m.income - m.expense),
      })),
    [monthlyCashFlow],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Financial Overview"
        description="Your aggregated wealth across personal accounts, investments, and goals."
        actions={
          <TransactionDialog
            trigger={
              <Button size="sm" className="cursor-pointer gap-1.5 rounded-lg shadow-sm">
                <Plus className="size-4" aria-hidden="true" /> Add Transaction
              </Button>
            }
          />
        }
      />

      <div className="border-border/80 flex flex-wrap items-center justify-between gap-4 border-b pb-1">
        <DashboardTabs
          pathname={pathname}
          LinkComponent={CustomLinkComponent}
          className="border-b-0"
        />
      </div>

      {/* KPI Cards: Net Worth, Income, Expenses, Savings Rate */}
      <DashboardKpiCards stats={stats} />

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left Column: Cash Flow & Trends (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          <ChartCard title="Monthly Cash Flow" hint="Last 6 months">
            <CashFlowChart data={monthlyCashFlow} />
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChartCard title="Expense Trend" hint="Monthly total">
              <ExpenseBarChart data={expenseData} />
            </ChartCard>
            <ChartCard title="Savings Trend" hint="Amount saved / month">
              <TrendLine data={savingsTrend} />
            </ChartCard>
          </div>
        </div>

        {/* Right Column: AI Insight & Category Allocation (1 Col) */}
        <div className="space-y-6">
          {FEATURE_FLAGS.AI_INSIGHT && <LiveAIInsightCard page="dashboard" cta="Review details" />}
          <DashboardCategoryCard categoryBreakdown={categoryBreakdown} />
        </div>
      </div>

      {/* Bottom Summary Stats */}
      <DashboardSummaryStats stats={stats} />
    </PageContainer>
  );
}

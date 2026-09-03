"use client";

import React, { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  ChartCard,
  Button,
  CashFlowChart,
  ExpenseBarChart,
  TrendLine,
} from "@finai/ui";
import { calculateNetCashFlow } from "@finai/finance-engine";
import { TransactionDialog } from "@/features/transactions/components";
import { useCategoryBreakdown, useDashboardStats, useMonthlyAnalytics } from "../api";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { DashboardCategoryCard } from "./DashboardCategoryCard";
import { DashboardHealthCard } from "./DashboardHealthCard";
import { DashboardSummaryStats } from "./DashboardSummaryStats";

export function DashboardPage() {
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
      calculateNetCashFlow(monthlyCashFlow).map((m) => ({
        month: m.month,
        value: Math.max(0, m.net),
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

      {/* KPI Cards: Net Worth, Income, Expenses, Savings Rate */}
      <DashboardKpiCards stats={stats} />

      {/* Row 1: Primary Overview — Cash Flow Chart (2 cols) + Financial Health (1 col) */}
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ChartCard
            title="Monthly Cash Flow"
            hint="Last 6 months"
            className="flex h-full flex-col justify-between"
          >
            <CashFlowChart data={monthlyCashFlow} />
          </ChartCard>
        </div>

        <div className="min-w-0 lg:col-span-1">
          <DashboardHealthCard />
        </div>
      </div>

      {/* Row 2: Deep Dive — Expense Trend, Savings Trend & Category Allocation (3 equal columns) */}
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-3">
        <ChartCard
          title="Expense Trend"
          hint="Monthly total"
          className="flex h-full flex-col justify-between"
        >
          <ExpenseBarChart data={expenseData} />
        </ChartCard>

        <ChartCard
          title="Savings Trend"
          hint="Amount saved / month"
          className="flex h-full flex-col justify-between"
        >
          <TrendLine data={savingsTrend} />
        </ChartCard>

        <DashboardCategoryCard categoryBreakdown={categoryBreakdown} />
      </div>

      {/* Row 3: Bottom Summary Highlights */}
      <DashboardSummaryStats stats={stats} />
    </PageContainer>
  );
}

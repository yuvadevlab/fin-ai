"use client";

import React, { useMemo, useState } from "react";
import { Info, Plus } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  ChartCard,
  Button,
  CashFlowChart,
  ExpenseBarChart,
  TrendLine,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@finai/ui";
import { calculateNetCashFlow } from "@finai/finance-engine";
import { TransactionDialog } from "@/features/transactions/components";
import { useCategoryBreakdown, useDashboardStats, useMonthlyAnalytics } from "../api";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { DashboardCategoryCard } from "./DashboardCategoryCard";
import { DashboardHealthCard } from "./DashboardHealthCard";
import { DashboardSummaryStats } from "./DashboardSummaryStats";
import { TrendCalculationDialog, type TrendGuideType } from "./TrendCalculationDialog";

export function DashboardPage() {
  const [cashFlowRange, setCashFlowRange] = useState<string>("6");
  const [trendGuide, setTrendGuide] = useState<TrendGuideType | null>(null);
  const { data: stats } = useDashboardStats();
  const { data: rawMonthlyCashFlow } = useMonthlyAnalytics(cashFlowRange);
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
            action={
              <Select value={cashFlowRange} onValueChange={setCashFlowRange}>
                <SelectTrigger
                  id="cashflow-range-trigger"
                  className="h-8 w-34 cursor-pointer text-xs font-medium"
                  aria-label="Select cash flow time period"
                >
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="3">Last 3 months</SelectItem>
                  <SelectItem value="6">Last 6 months</SelectItem>
                  <SelectItem value="12">Last 12 months</SelectItem>
                  <SelectItem value="24">Last 2 years</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            }
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
          action={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground -mr-1 size-6 cursor-pointer rounded-md"
                    aria-label="Learn how expense trend is calculated"
                    onClick={() => setTrendGuide("expense")}
                  >
                    <Info className="size-3.5" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>How this is calculated</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
          className="flex h-full flex-col justify-between"
        >
          <ExpenseBarChart data={expenseData} />
        </ChartCard>

        <ChartCard
          title="Savings Trend"
          hint="Amount saved / month"
          action={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground -mr-1 size-6 cursor-pointer rounded-md"
                    aria-label="Learn how savings trend is calculated"
                    onClick={() => setTrendGuide("savings")}
                  >
                    <Info className="size-3.5" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>How this is calculated</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
          className="flex h-full flex-col justify-between"
        >
          <TrendLine data={savingsTrend} />
        </ChartCard>

        <DashboardCategoryCard categoryBreakdown={categoryBreakdown} />
      </div>

      {/* Row 3: Bottom Summary Highlights */}
      <DashboardSummaryStats stats={stats} />

      {/* Trend calculation methodology dialog */}
      <TrendCalculationDialog
        type={trendGuide}
        onOpenChange={(open) => !open && setTrendGuide(null)}
      />
    </PageContainer>
  );
}

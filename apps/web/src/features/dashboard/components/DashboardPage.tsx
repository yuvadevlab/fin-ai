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
import { UI_COPY } from "@/lib/ui-copy";
import { DashboardSummaryStats } from "./DashboardSummaryStats";
import { TrendCalculationDialog, type TrendGuideType } from "./TrendCalculationDialog";
import { WorkspaceInvitationCard } from "@/features/workspaces/components";
import { useWorkspace } from "@/providers";

export function DashboardPage() {
  const [cashFlowRange, setCashFlowRange] = useState<string>("6");
  const [trendGuide, setTrendGuide] = useState<TrendGuideType | null>(null);
  const { data: stats } = useDashboardStats();
  const { data: rawMonthlyCashFlow } = useMonthlyAnalytics(cashFlowRange);
  const { data: rawCategoryBreakdown } = useCategoryBreakdown();
  const { isReadOnly } = useWorkspace();

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
        title={UI_COPY.DASHBOARD.PAGE.TITLE}
        description={UI_COPY.DASHBOARD.PAGE.DESCRIPTION}
        actions={
          isReadOnly ? undefined : (
            <TransactionDialog
              trigger={
                <Button size="sm" className="cursor-pointer gap-1.5 rounded-lg shadow-sm">
                  <Plus className="size-4" aria-hidden="true" />{" "}
                  {UI_COPY.DASHBOARD.PAGE.ADD_TRANSACTION}
                </Button>
              }
            />
          )
        }
      />

      {/* Pending Workspace Invitations Card */}
      <WorkspaceInvitationCard />

      {/* KPI Cards: Net Worth, Income, Expenses, Savings Rate */}
      <DashboardKpiCards stats={stats} />

      {/* Row 1: Primary Overview — Cash Flow Chart (2 cols) + Financial Health (1 col) */}
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ChartCard
            title={UI_COPY.DASHBOARD.PAGE.MONTHLY_CASH_FLOW}
            action={
              <Select value={cashFlowRange} onValueChange={setCashFlowRange}>
                <SelectTrigger
                  id="cashflow-range-trigger"
                  className="h-8 w-34 cursor-pointer text-xs font-medium"
                  aria-label={UI_COPY.DASHBOARD.CASH_FLOW.RANGE_LABEL}
                >
                  <SelectValue placeholder={UI_COPY.DASHBOARD.CASH_FLOW.PERIOD_PLACEHOLDER} />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="3">
                    {UI_COPY.DASHBOARD.CASH_FLOW.RANGES.THREE_MONTHS}
                  </SelectItem>
                  <SelectItem value="6">{UI_COPY.DASHBOARD.CASH_FLOW.RANGES.SIX_MONTHS}</SelectItem>
                  <SelectItem value="12">
                    {UI_COPY.DASHBOARD.CASH_FLOW.RANGES.TWELVE_MONTHS}
                  </SelectItem>
                  <SelectItem value="24">{UI_COPY.DASHBOARD.CASH_FLOW.RANGES.TWO_YEARS}</SelectItem>
                  <SelectItem value="all">{UI_COPY.DASHBOARD.CASH_FLOW.RANGES.ALL_TIME}</SelectItem>
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
          title={UI_COPY.DASHBOARD.PAGE.EXPENSE_TREND}
          hint={UI_COPY.DASHBOARD.PAGE.EXPENSE_TREND_HINT}
          action={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground -mr-1 size-6 cursor-pointer rounded-md"
                    aria-label={UI_COPY.DASHBOARD.PAGE.LEARN_EXPENSE}
                    onClick={() => setTrendGuide("expense")}
                  >
                    <Info className="size-3.5" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{UI_COPY.DASHBOARD.PAGE.LEARN_CALCULATION}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
          className="flex h-full flex-col justify-between"
        >
          <ExpenseBarChart data={expenseData} />
        </ChartCard>

        <ChartCard
          title={UI_COPY.DASHBOARD.PAGE.SAVINGS_TREND}
          hint={UI_COPY.DASHBOARD.PAGE.SAVINGS_TREND_HINT}
          action={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground -mr-1 size-6 cursor-pointer rounded-md"
                    aria-label={UI_COPY.DASHBOARD.PAGE.LEARN_SAVINGS}
                    onClick={() => setTrendGuide("savings")}
                  >
                    <Info className="size-3.5" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{UI_COPY.DASHBOARD.PAGE.LEARN_CALCULATION}</TooltipContent>
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

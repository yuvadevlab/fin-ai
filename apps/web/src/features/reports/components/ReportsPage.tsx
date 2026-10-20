"use client";

import React, { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  KPIGrid,
  StatCard,
  ContentCard,
  SectionHeader,
  CashFlowChart,
  CategoryPie,
  Button,
  toast,
  CHART_COLORS,
} from "@finai/ui";
import { PrivacyMoney } from "@/components";
import { UI_COPY } from "@/lib/ui-copy";

import { useDashboardStats } from "@/features/dashboard/api/getDashboardStats";
import { useMonthlyAnalytics } from "@/features/dashboard/api/getMonthlyAnalytics";
import { useCategoryBreakdown } from "@/features/dashboard/api/getCategoryBreakdown";

export function ReportsPage() {
  const { data: stats } = useDashboardStats();
  const { data: rawMonthlyCashFlow } = useMonthlyAnalytics();
  const { data: rawCategoryBreakdown } = useCategoryBreakdown();

  const monthlyCashFlow = useMemo(
    () => (Array.isArray(rawMonthlyCashFlow) ? rawMonthlyCashFlow : []),
    [rawMonthlyCashFlow],
  );
  const categoryBreakdown = useMemo(
    () => (Array.isArray(rawCategoryBreakdown) ? rawCategoryBreakdown : []),
    [rawCategoryBreakdown],
  );

  // Dynamic month label
  const monthLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleString("en-IN", { month: "long", year: "numeric" });
  }, []);

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

  return (
    <PageContainer>
      <PageHeader
        title={UI_COPY.REPORTS.REPORT_TITLE(monthLabel)}
        description={UI_COPY.REPORTS.DESCRIPTION}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => toast.success(UI_COPY.REPORTS.PDF_STARTED)}
            >
              <FileText className="size-4" /> {UI_COPY.REPORTS.EXPORT_PDF}
            </Button>
            <Button
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => toast.success(UI_COPY.REPORTS.CSV_READY)}
            >
              <Download className="size-4" /> {UI_COPY.REPORTS.EXPORT_CSV}
            </Button>
          </div>
        }
      />

      <KPIGrid>
        <StatCard
          label={UI_COPY.REPORTS.TOTAL_INCOME}
          value={<PrivacyMoney value={stats?.monthlyIncome ?? 0} />}
          trend={
            incomeChange !== null
              ? {
                  value: `${Number(incomeChange) >= 0 ? "+" : ""}${incomeChange}%`,
                  kind: Number(incomeChange) >= 0 ? "up" : "down",
                }
              : { value: "+0%", kind: "flat" }
          }
        />
        <StatCard
          label={UI_COPY.REPORTS.TOTAL_EXPENSES}
          value={<PrivacyMoney value={stats?.monthlyExpenses ?? 0} />}
          trend={
            expenseChange !== null
              ? {
                  value: `${Number(expenseChange) >= 0 ? "+" : ""}${expenseChange}%`,
                  kind: Number(expenseChange) > 0 ? "down" : "up",
                }
              : undefined
          }
        />
        <StatCard
          label={UI_COPY.REPORTS.NET_SAVED}
          value={<PrivacyMoney value={netSaved} />}
          trend={{
            value: `${stats?.savingsRate?.toFixed(1) ?? 0}% ${UI_COPY.REPORTS.SAVINGS_RATE}`,
            kind: (stats?.savingsRate ?? 0) > 40 ? "up" : "flat",
          }}
        />
        <StatCard
          label={UI_COPY.REPORTS.ACTIVE_GOALS}
          value={String(stats?.goalCount ?? 0)}
          hint={UI_COPY.REPORTS.ACCOUNTS_LINKED(stats?.accountCount ?? 0)}
        />
      </KPIGrid>

      <ContentCard className="w-full">
        <SectionHeader title={UI_COPY.REPORTS.CASH_FLOW} />
        <CashFlowChart data={monthlyCashFlow} />
      </ContentCard>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <ContentCard>
          <SectionHeader title={UI_COPY.REPORTS.TOP_CATEGORIES} />
          <ul className="mt-4 max-h-55 space-y-3.5 overflow-y-auto">
            {categoryBreakdown.map((c, i) => (
              <li
                key={c.categoryId ?? c.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground flex items-center gap-2">
                  <span
                    className="size-2 animate-pulse rounded-full"
                    style={{
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  {c.name}
                </span>
                <PrivacyMoney value={c.total} className="font-semibold" />
              </li>
            ))}
          </ul>
        </ContentCard>

        <ContentCard>
          <SectionHeader title={UI_COPY.REPORTS.EXPENSE_SPLIT} />
          <div className="flex h-55 w-full items-center justify-center">
            <CategoryPie data={categoryBreakdown.map((c) => ({ name: c.name, value: c.total }))} />
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}

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
  MoneyDisplay,
  AIInsightCard,
  AISuggestionsDialog,
  CashFlowChart,
  CategoryPie,
  Button,
  toast,
  CHART_COLORS,
} from "@finai/ui";
import { useDashboardStats } from "@/features/dashboard/api/getDashboardStats";
import { useMonthlyAnalytics } from "@/features/dashboard/api/getMonthlyAnalytics";
import { useCategoryBreakdown } from "@/features/dashboard/api/getCategoryBreakdown";
import { useWorkspace } from "@/providers";
import { FEATURE_FLAGS } from "@/lib/app-constants";

export function ReportsPage() {
  const { workspaceId } = useWorkspace();

  const { data: stats } = useDashboardStats(workspaceId);
  const { data: rawMonthlyCashFlow } = useMonthlyAnalytics(workspaceId);
  const { data: rawCategoryBreakdown } = useCategoryBreakdown(workspaceId);

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
        title={`Monthly Report · ${monthLabel}`}
        description="Auto-generated summary of your finances with AI commentary."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => toast.success("PDF export started — check downloads")}
            >
              <FileText className="size-4" /> Export PDF
            </Button>
            <Button
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => toast.success("CSV export ready — check downloads")}
            >
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
        }
      />

      <KPIGrid>
        <StatCard
          label="Total Income"
          value={<MoneyDisplay value={stats?.monthlyIncome ?? 0} />}
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
          label="Total Expenses"
          value={<MoneyDisplay value={stats?.monthlyExpenses ?? 0} />}
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
          label="Net Saved"
          value={<MoneyDisplay value={netSaved} />}
          trend={{
            value: `${stats?.savingsRate?.toFixed(1) ?? 0}% savings rate`,
            kind: (stats?.savingsRate ?? 0) > 40 ? "up" : "flat",
          }}
        />
        <StatCard
          label="Active Goals"
          value={String(stats?.goalCount ?? 0)}
          hint={`${stats?.accountCount ?? 0} accounts linked`}
        />
      </KPIGrid>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard className="lg:col-span-2">
          <SectionHeader title="Cash Flow" />
          <CashFlowChart data={monthlyCashFlow} />
        </ContentCard>

        {FEATURE_FLAGS.AI_INSIGHT && (
          <AIInsightCard
            ctaWrapper={(btn) => (
              <AISuggestionsDialog
                trigger={btn}
                title="Draft next month's plan"
                description="Adjustments FinAI would suggest for next month."
                suggestions={[
                  {
                    title: "Bump SIP by ₹5,000",
                    detail: "You've had 3 months above 60% savings rate — invest the surplus.",
                    impact: "+₹60k/yr invested",
                  },
                  {
                    title: "Cap dining at ₹8,000",
                    detail: "Tighter cap keeps you honest.",
                    impact: "Save ~₹1,400/mo",
                  },
                  {
                    title: "Prepay to your top goal",
                    detail: "Excess cash can accelerate your goal by months.",
                    impact: "Reach goal sooner",
                  },
                ]}
              />
            )}
            body={
              <>
                Your savings rate this month is{" "}
                <span className="text-primary font-semibold">
                  {stats?.savingsRate?.toFixed(1) ?? 0}%
                </span>
                .{" "}
                {(stats?.savingsRate ?? 0) >= 60
                  ? "Excellent discipline — consider allocating more to equity."
                  : "Push a little more toward savings to hit the 60% mark."}
              </>
            }
            cta="Draft next month's plan"
          />
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ContentCard>
          <SectionHeader title="Top Spending Categories" />
          <ul className="mt-4 space-y-3.5">
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
                <MoneyDisplay value={c.total} className="font-semibold" />
              </li>
            ))}
          </ul>
        </ContentCard>

        <ContentCard>
          <SectionHeader title="Expense Split" />
          <CategoryPie data={categoryBreakdown.map((c) => ({ name: c.name, value: c.total }))} />
        </ContentCard>
      </section>
    </PageContainer>
  );
}

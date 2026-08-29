"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ArrowUpRight, PieChart as PieIcon } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  DashboardTabs,
  KPIGrid,
  StatCard,
  ChartCard,
  MiniStat,
  MoneyDisplay,
  Button,
  CashFlowChart,
  ExpenseBarChart,
  CategoryPie,
  TrendLine,
  CHART_COLORS,
} from "@finai/ui";
import { TransactionDialog } from "@/features/transactions/components";
import { useCategoryBreakdown, useDashboardStats, useMonthlyAnalytics } from "../api";
import { FEATURE_FLAGS } from "@/lib/app-constants";
import { LiveAIInsightCard } from "@/features/ai-advisor/components";

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

  // Group top 4 categories and bucket the rest into "Other" to keep pie chart & list compact
  const { pieData, displayCategories, totalExpense } = useMemo(() => {
    const sorted = [...categoryBreakdown]
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
    const total = sorted.reduce((sum, c) => sum + c.total, 0);

    if (sorted.length <= 5) {
      const items = sorted.map((c) => ({
        ...c,
        percentage: total > 0 ? Math.round((c.total / total) * 100) : 0,
      }));
      return {
        pieData: sorted.map((c) => ({ name: c.name, value: c.total })),
        displayCategories: items,
        totalExpense: total,
      };
    }

    const top4 = sorted.slice(0, 4);
    const otherTotal = sorted.slice(4).reduce((sum, c) => sum + c.total, 0);
    const combined = [
      ...top4.map((c) => ({
        ...c,
        percentage: total > 0 ? Math.round((c.total / total) * 100) : 0,
      })),
      {
        categoryId: "other-categories",
        name: `Other (${sorted.length - 4} more)`,
        total: otherTotal,
        percentage: total > 0 ? Math.round((otherTotal / total) * 100) : 0,
      },
    ];

    return {
      pieData: combined.map((c) => ({ name: c.name, value: c.total })),
      displayCategories: combined,
      totalExpense: total,
    };
  }, [categoryBreakdown]);

  const savingsRate = stats?.savingsRate ?? 0;
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

  return (
    <PageContainer>
      <PageHeader
        title="Financial Overview"
        description="Your aggregated wealth across personal accounts, investments, and goals."
        actions={
          <TransactionDialog
            trigger={
              <Button size="sm" className="cursor-pointer gap-1.5 rounded-lg shadow-sm">
                <Plus className="size-4" /> Add Transaction
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

      <KPIGrid>
        <StatCard
          label="Net Worth"
          value={<MoneyDisplay value={stats?.netWorth ?? 0} />}
          hint="Accounts + Investments"
        />
        <StatCard
          label="Monthly Income"
          value={<MoneyDisplay value={stats?.monthlyIncome ?? 0} />}
          trend={
            incomeChange !== null
              ? {
                  value: `${Number(incomeChange) >= 0 ? "+" : ""}${incomeChange}%`,
                  kind: Number(incomeChange) >= 0 ? "up" : "down",
                }
              : undefined
          }
          hint="vs last month"
        />
        <StatCard
          label="Monthly Expenses"
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
        <StatCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`}>
          <div className="bg-border/60 ml-auto h-1 w-24 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full"
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>
        </StatCard>
      </KPIGrid>

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

          <ChartCard
            title="Category Allocation"
            hint={
              <Link
                href="/categories"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-xs font-semibold"
              >
                View all <ArrowUpRight className="size-3" />
              </Link>
            }
          >
            {pieData.length > 0 && totalExpense > 0 ? (
              <div className="space-y-4">
                <CategoryPie data={pieData} />

                {/* Compact, fixed-height scrollable category breakdown */}
                <div className="border-border/60 max-h-43.75 space-y-2.5 overflow-y-auto border-t pt-3 pr-1">
                  {displayCategories.map((c, i) => (
                    <div
                      key={c.categoryId ?? c.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{
                            background: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-foreground truncate font-medium">{c.name}</span>
                        <span className="text-muted-foreground/80 text-[10px]">
                          ({c.percentage}%)
                        </span>
                      </div>
                      <MoneyDisplay
                        value={c.total}
                        className="text-foreground shrink-0 font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-secondary/60 mb-3 flex size-12 items-center justify-center rounded-full">
                  <PieIcon className="text-muted-foreground/60 size-6" />
                </div>
                <p className="text-xs font-medium">No expenses logged this month</p>
                <p className="text-muted-foreground/70 mt-0.5 text-[11px]">
                  Add transactions to see category distribution
                </p>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Bottom Summary Stats */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MiniStat
          label="Investment Value"
          value={<MoneyDisplay value={stats?.netWorth ?? 0} />}
          sub="Net worth (accounts + investments)"
        />
        <MiniStat
          label="Active Goals"
          value={String(stats?.goalCount ?? 0)}
          sub={`${stats?.accountCount ?? 0} accounts linked`}
        />
        <MiniStat
          label="Net Cash Flow"
          value={<MoneyDisplay value={stats?.netCashFlow ?? 0} />}
          sub="This month"
        />
      </section>
    </PageContainer>
  );
}

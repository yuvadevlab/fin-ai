"use client";

import React, { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
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
import { TransactionDialog } from "../../transactions/components";
import { useDashboardStats } from "../api/getDashboardStats";
import { useMonthlyAnalytics } from "../api/getMonthlyAnalytics";
import { useCategoryBreakdown } from "../api/getCategoryBreakdown";
import { useWorkspace } from "@/providers";
import { FEATURE_FLAGS } from "@/lib/app-constants";
import { LiveAIInsightCard } from "@/features/ai-advisor/components";

export function DashboardPage() {
  const pathname = usePathname();
  const { workspaceId } = useWorkspace();

  const { data: stats } = useDashboardStats(workspaceId);
  const { data: rawMonthlyCashFlow } = useMonthlyAnalytics(workspaceId);
  const { data: rawCategoryBreakdown } = useCategoryBreakdown(workspaceId);

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

  const pieData = useMemo(
    () => categoryBreakdown.map((c) => ({ name: c.name, value: c.total })),
    [categoryBreakdown],
  );

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
        title="Financial Overview"
        description="Your aggregated wealth across accounts, investments, and goals in this workspace."
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

      <DashboardTabs pathname={pathname} LinkComponent={customLink} />

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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

        <div className="space-y-6">
          {FEATURE_FLAGS.AI_INSIGHT && <LiveAIInsightCard page="dashboard" cta="Review details" />}
          <ChartCard title="Category Allocation" hint="This month">
            <CategoryPie data={pieData} />
            <ul className="mt-4 space-y-3">
              {categoryBreakdown.map((c, i) => (
                <li
                  key={c.categoryId ?? c.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <MoneyDisplay value={c.total} className="text-foreground font-medium" />
                </li>
              ))}
            </ul>
          </ChartCard>
        </div>
      </div>

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

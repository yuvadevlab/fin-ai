"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  DashboardTabs,
  KPIGrid,
  StatCard,
  ChartCard,
  AIInsightCard,
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

// TODO: Replace mock data with real data from API
interface DashboardPageProps {
  categoryBreakdown: { name: string; value: number }[];
  monthlyCashFlow: { month: string; income: number; expense: number }[];
  savingsTrend: { month: string; value: number }[];
}

export function DashboardPage({
  categoryBreakdown,
  monthlyCashFlow,
  savingsTrend,
}: DashboardPageProps) {
  const pathname = usePathname();
  const expenseData = React.useMemo(
    () => monthlyCashFlow.map((m) => ({ month: m.month, expense: m.expense })),
    [monthlyCashFlow],
  );

  const customLink = React.useCallback(
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
        description="Your aggregated wealth across personal accounts. AI insights updated 3 minutes ago."
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
          label="Net Balance"
          value={<MoneyDisplay value={842500} />}
          trend={{ value: "+12.4%", kind: "up" }}
          hint="vs last month"
        />
        <StatCard
          label="Monthly Income"
          value={<MoneyDisplay value={125000} />}
          trend={{ value: "Stable", kind: "flat" }}
        />
        <StatCard
          label="Monthly Expenses"
          value={<MoneyDisplay value={48200} />}
          trend={{ value: "+8.2%", kind: "down" }}
          hint="Dining +18%"
        />
        <StatCard label="Savings Rate" value="61.4%">
          <div className="bg-border/60 ml-auto h-1 w-24 overflow-hidden rounded-full">
            <div className="bg-primary h-full w-[61%]" />
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
            <ChartCard title="Lave-Savin Trend" hint="Amount saved / month">
              <TrendLine data={savingsTrend} />
            </ChartCard>
          </div>
        </div>

        <div className="space-y-6">
          <AIInsightCard
            title="Insight #12"
            body={
              <>
                You spent <span className="text-foreground font-semibold">18% more</span> on food
                this month. Reducing dining expenses could save approximately{" "}
                <span className="text-primary font-semibold">₹2,500</span> toward your Vacation
                goal.
              </>
            }
            cta="Review Dining Categories"
          />

          <ChartCard title="Category Allocation" hint="This month">
            <CategoryPie data={categoryBreakdown} />
            <ul className="mt-4 space-y-3">
              {categoryBreakdown.map((c, i) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <MoneyDisplay value={c.value} className="text-foreground font-medium" />
                </li>
              ))}
            </ul>
          </ChartCard>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MiniStat
          label="Investment Value"
          value={<MoneyDisplay value={1135000} />}
          icon={<TrendingUp className="text-primary size-4" />}
          sub="+9.4% YTD"
        />
        <MiniStat label="Budget Status" value="On track" sub="4 of 6 categories within limit" />
        <MiniStat
          label="Savings"
          value={<MoneyDisplay value={76800} />}
          icon={<TrendingDown className="text-muted-foreground size-4" />}
          sub="This month"
        />
      </section>
    </PageContainer>
  );
}

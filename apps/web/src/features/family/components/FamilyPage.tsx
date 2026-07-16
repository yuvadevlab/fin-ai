"use client";

import React, { useCallback } from "react";
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
  AIInsightCard,
  CashFlowChart,
  CategoryPie,
  TrendLine,
  CHART_COLORS,
  toast,
} from "@finai/ui";

const upcoming = [
  { name: "Home Rent", due: "Apr 1", amount: 32000 },
  { name: "Electricity Bill", due: "Apr 3", amount: 4200 },
  { name: "School Fee", due: "Apr 5", amount: 18500 },
  { name: "Internet — ACT", due: "Apr 8", amount: 1499 },
];

// TODO: Replace with real data from API
interface FamilyPageProps {
  categoryBreakdown: { name: string; value: number }[];
  monthlyCashFlow: {
    month: string;
    income: number;
    expense: number;
  }[];
  savingsTrend: {
    month: string;
    value: number;
  }[];
}

export function FamilyPage({ categoryBreakdown, monthlyCashFlow, savingsTrend }: FamilyPageProps) {
  const pathname = usePathname();

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
        description="Shared spending, bills, and goals across the Sharma Family workspace."
      />

      <DashboardTabs pathname={pathname} LinkComponent={customLink} />

      <KPIGrid>
        <StatCard
          label="Combined Income"
          value={<MoneyDisplay value={215000} />}
          trend={{ value: "+6.2%", kind: "up" }}
        />
        <StatCard
          label="Combined Expenses"
          value={<MoneyDisplay value={112400} />}
          trend={{ value: "-3.1%", kind: "up" }}
          hint="vs Feb"
        />
        <StatCard
          label="Family Savings"
          value={<MoneyDisplay value={102600} />}
          trend={{ value: "+11.4%", kind: "up" }}
        />
        <StatCard label="Shared Budget" value="72%" hint="of monthly cap used">
          <div className="bg-border/60 ml-auto h-1 w-24 overflow-hidden rounded-full">
            <div className="bg-primary h-full w-[72%]" />
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
              <span className="text-muted-foreground text-xs">Cumulative saved</span>
            </div>
            <TrendLine data={savingsTrend} />
          </ContentCard>
        </div>

        <div className="space-y-6">
          <AIInsightCard
            variant="light"
            onCtaClick={() => toast.success("₹4,500 moved to Europe Vacation goal")}
            body={
              <>
                Your family reduced transport expenses by{" "}
                <span className="text-foreground font-semibold">12%</span> compared to last month.
                Consider redirecting savings to the Europe Vacation goal.
              </>
            }
            cta="Allocate ₹4,500 to Vacation"
          />

          <ContentCard>
            <SectionHeader title="Shared Category Spending" />
            <CategoryPie data={categoryBreakdown} />
            <ul className="mt-4 space-y-2 text-sm">
              {categoryBreakdown.slice(0, 4).map((c, i) => (
                <li key={c.name} className="flex items-center justify-between">
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
                    <MoneyDisplay value={c.value} />
                  </span>
                </li>
              ))}
            </ul>
          </ContentCard>

          <ContentCard>
            <SectionHeader title="Upcoming Bills" />
            <ul className="space-y-3.5">
              {upcoming.map((b) => (
                <li key={b.name} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-foreground font-bold">{b.name}</p>
                    <p className="text-muted-foreground text-xs">Due {b.due}</p>
                  </div>
                  <MoneyDisplay value={b.amount} />
                </li>
              ))}
            </ul>
          </ContentCard>
        </div>
      </div>
    </PageContainer>
  );
}

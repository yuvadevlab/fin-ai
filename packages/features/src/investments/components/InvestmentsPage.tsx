"use client";

import React from "react";
import {
  PageContainer,
  PageHeader,
  StatCard,
  ContentCard,
  MoneyDisplay,
  DataTable,
  SectionHeader,
  CategoryPie,
  TrendLine,
  CHART_COLORS,
  cn,
} from "@finai/ui";

// TODO: Replace with real data from API
interface InvestmentsPageProps {
  investments: {
    name: string;
    value: number;
    change: number;
    allocation: number;
  }[];
  savingsTrend: {
    month: string;
    value: number;
  }[];
}

export function InvestmentsPage({ investments, savingsTrend }: InvestmentsPageProps) {
  const total = React.useMemo(() => investments.reduce((s, a) => s + a.value, 0), [investments]);
  const pieData = React.useMemo(
    () => investments.map((i) => ({ name: i.name, value: i.value })),
    [investments],
  );
  const trendData = React.useMemo(
    () => savingsTrend.map((s) => ({ month: s.month, value: s.value * 14 })),
    [savingsTrend],
  );

  const columns = React.useMemo(
    () => [
      {
        header: "Asset",
        accessor: (a: { name: string }) => a.name,
        className: "font-semibold",
      },
      {
        header: "Value",
        accessor: (a: { value: number }) => <MoneyDisplay value={a.value} />,
        className: "text-right",
      },
      {
        header: "Change",
        accessor: (a: { change: number }) => (
          <span
            className={cn(
              "font-bold tabular-nums",
              a.change > 0 ? "text-primary" : "text-destructive",
            )}
          >
            {a.change > 0 ? "+" : ""}
            {a.change}%
          </span>
        ),
        className: "text-right",
      },
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Investments"
        description="Portfolio across mutual funds, stocks, gold, and retirement instruments."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Value"
          value={<MoneyDisplay value={total} />}
          trend={{ value: "+9.4%", kind: "up" }}
          hint="YTD"
        />
        <StatCard
          label="Unrealised P/L"
          value={<MoneyDisplay value={98450} />}
          trend={{ value: "+₹12,300", kind: "up" }}
          hint="this month"
        />
        <StatCard label="XIRR" value="14.2%" trend={{ value: "Above benchmark", kind: "up" }} />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard>
          <SectionHeader title="Asset Allocation" />
          <CategoryPie data={pieData} />
          <ul className="mt-4 space-y-2.5 text-sm">
            {investments.map((a, i) => (
              <li key={a.name} className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  {a.name}
                </span>
                <span className="text-foreground font-semibold">{a.allocation}%</span>
              </li>
            ))}
          </ul>
        </ContentCard>

        <div className="space-y-6 lg:col-span-2">
          <ContentCard>
            <SectionHeader title="Portfolio Value" />
            <TrendLine data={trendData} />
          </ContentCard>

          <DataTable
            data={investments}
            columns={columns}
            rowKey={(inv: { name: string }) => inv.name}
          />
        </div>
      </section>
    </PageContainer>
  );
}

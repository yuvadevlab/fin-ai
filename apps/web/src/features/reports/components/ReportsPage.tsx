"use client";

import React from "react";
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

// TODO: Replace with real data from API
interface ReportsPageProps {
  categoryBreakdown: {
    name: string;
    value: number;
  }[];
  monthlyCashFlow: {
    month: string;
    income: number;
    expense: number;
  }[];
}

export function ReportsPage({ categoryBreakdown, monthlyCashFlow }: ReportsPageProps) {
  return (
    <PageContainer>
      <PageHeader
        title="Monthly Report · March 2026"
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
          value={<MoneyDisplay value={125000} />}
          trend={{ value: "+0%", kind: "flat" }}
        />
        <StatCard
          label="Total Expenses"
          value={<MoneyDisplay value={48200} />}
          trend={{ value: "+8.2%", kind: "down" }}
        />
        <StatCard
          label="Net Saved"
          value={<MoneyDisplay value={76800} />}
          trend={{ value: "+11.4%", kind: "up" }}
        />
        <StatCard label="Goal Progress" value="+₹42,500" hint="Applied to 3 goals" />
      </KPIGrid>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard className="lg:col-span-2">
          <SectionHeader title="Cash Flow" />
          <CashFlowChart data={monthlyCashFlow} />
        </ContentCard>

        <AIInsightCard
          ctaWrapper={(btn) => (
            <AISuggestionsDialog
              trigger={btn}
              title="Draft next month's plan"
              description="Adjustments FinAI would suggest for April."
              suggestions={[
                {
                  title: "Bump SIP by ₹5,000",
                  detail: "You've had 3 months above 60% savings rate — invest the surplus.",
                  impact: "+₹60k/yr invested",
                },
                {
                  title: "Cap dining at ₹8,000",
                  detail: "March overshoot was ₹1,400. Tighter cap keeps you honest.",
                  impact: "Save ~₹1,400/mo",
                },
                {
                  title: "Prepay ₹25,000 to House goal",
                  detail: "Excess cash sits idle in HDFC Salary.",
                  impact: "Reach goal 2 months sooner",
                },
              ]}
            />
          )}
          body={
            <>
              March was your third consecutive month with a savings rate above{" "}
              <span className="text-primary font-semibold">60%</span>. Your emergency fund is now
              6.2 months of expenses — you can begin allocating more to equity.
            </>
          }
          cta="Draft next month's plan"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ContentCard>
          <SectionHeader title="Top Spending Categories" />
          <ul className="mt-4 space-y-3.5">
            {categoryBreakdown.map((c, i) => (
              <li key={c.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <span
                    className="size-2 animate-pulse rounded-full"
                    style={{
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  {c.name}
                </span>
                <MoneyDisplay value={c.value} className="font-semibold" />
              </li>
            ))}
          </ul>
        </ContentCard>

        <ContentCard>
          <SectionHeader title="Expense Split" />
          <CategoryPie data={categoryBreakdown} />
        </ContentCard>
      </section>
    </PageContainer>
  );
}

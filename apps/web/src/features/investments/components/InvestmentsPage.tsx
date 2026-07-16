"use client";

import React, { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  StatCard,
  ContentCard,
  MoneyDisplay,
  DataTable,
  SectionHeader,
  CategoryPie,
  CHART_COLORS,
  cn,
  Button,
} from "@finai/ui";
import { useInvestments, Investment } from "../api/getInvestments";
import { InvestmentDialog } from "./InvestmentDialog";
import { useWorkspace } from "@/providers";

const ASSET_CLASS_LABELS: Record<Investment["assetClass"], string> = {
  MUTUAL_FUND: "Mutual Fund",
  STOCK: "Stocks",
  FIXED_DEPOSIT: "Fixed Deposit",
  GOLD: "Gold",
  EPF: "EPF",
  PPF: "PPF",
  REAL_ESTATE: "Real Estate",
  CRYPTO: "Crypto",
  OTHER: "Other",
};

export function InvestmentsPage() {
  const { workspaceId } = useWorkspace();
  const { data: rawInvestments } = useInvestments(workspaceId);
  // Guard against non-array during hydration
  const investments: Investment[] = useMemo(
    () => (Array.isArray(rawInvestments) ? rawInvestments : []),
    [rawInvestments],
  );

  const totalValue = useMemo(
    () => investments.reduce((s, a) => s + (a.currentValue ?? 0), 0),
    [investments],
  );

  const totalInvested = useMemo(
    () => investments.reduce((s, a) => s + (a.investedAmount ?? 0), 0),
    [investments],
  );

  const unrealisedPL = totalValue - totalInvested;

  const pieData = useMemo(
    () =>
      investments.map((i) => ({
        name: ASSET_CLASS_LABELS[i.assetClass] ?? i.assetClass,
        value: i.currentValue ?? 0,
      })),
    [investments],
  );

  // Group by asset class for allocation breakdown
  const allocationByClass = useMemo(() => {
    const grouped: Record<string, number> = {};
    investments.forEach((i) => {
      const label = ASSET_CLASS_LABELS[i.assetClass] ?? i.assetClass;
      grouped[label] = (grouped[label] ?? 0) + (i.currentValue ?? 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [investments]);

  const columns = useMemo(
    () => [
      {
        header: "Asset",
        accessor: (a: Investment) => (
          <div>
            <p className="font-semibold">{a.name}</p>
            <p className="text-muted-foreground text-xs">{ASSET_CLASS_LABELS[a.assetClass]}</p>
          </div>
        ),
      },
      {
        header: "Invested",
        accessor: (a: Investment) => <MoneyDisplay value={a.investedAmount ?? 0} />,
        className: "text-right",
      },
      {
        header: "Current Value",
        accessor: (a: Investment) => <MoneyDisplay value={a.currentValue ?? 0} />,
        className: "text-right",
      },
      {
        header: "P&L",
        accessor: (a: Investment) => {
          const pl = (a.currentValue ?? 0) - (a.investedAmount ?? 0);
          const pct = a.investedAmount > 0 ? ((pl / a.investedAmount) * 100).toFixed(1) : "0.0";
          return (
            <span
              className={cn(
                "font-bold tabular-nums",
                pl >= 0 ? "text-primary" : "text-destructive",
              )}
            >
              {pl >= 0 ? "+" : ""}
              {pct}%
            </span>
          );
        },
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
        actions={
          <InvestmentDialog
            trigger={
              <Button size="sm" className="cursor-pointer gap-1.5">
                <Plus className="size-4" /> Track Investment
              </Button>
            }
          />
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Value"
          value={<MoneyDisplay value={totalValue} />}
          hint="Current market value"
        />
        <StatCard
          label="Total Invested"
          value={<MoneyDisplay value={totalInvested} />}
          hint="Principal amount"
        />
        <StatCard
          label="Unrealised P&L"
          value={<MoneyDisplay value={Math.abs(unrealisedPL)} />}
          trend={
            unrealisedPL >= 0 ? { value: "Gain", kind: "up" } : { value: "Loss", kind: "down" }
          }
          hint="Current return"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard>
          <SectionHeader title="Asset Allocation" />
          <CategoryPie data={pieData} />
          <ul className="mt-4 space-y-2.5 text-sm">
            {allocationByClass.map((a, i) => (
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
                <span className="text-foreground font-semibold">
                  {totalValue > 0 ? `${((a.value / totalValue) * 100).toFixed(1)}%` : "0%"}
                </span>
              </li>
            ))}
          </ul>
        </ContentCard>

        <div className="space-y-6 lg:col-span-2">
          <DataTable data={investments} columns={columns} rowKey={(inv: Investment) => inv.id} />
        </div>
      </section>
    </PageContainer>
  );
}

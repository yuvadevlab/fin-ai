"use client";

import React from "react";
import { KPIGrid, StatCard } from "@finai/ui";
import { calculateSavingsRate, formatINR } from "@finai/finance-engine";
import { PrivacyMoney } from "@/components";
import type { DashboardStats } from "../api";
import { UI_COPY } from "@/lib/ui-copy";

export interface DashboardKpiCardsProps {
  stats?: DashboardStats;
}

export function DashboardKpiCards({ stats }: DashboardKpiCardsProps) {
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

  const lastMonthSavingsRate =
    stats && stats.lastMonthIncome > 0
      ? calculateSavingsRate(stats.lastMonthIncome, stats.lastMonthExpenses)
      : null;

  const savingsRateChange =
    lastMonthSavingsRate !== null ? (savingsRate - lastMonthSavingsRate).toFixed(1) : null;

  return (
    <KPIGrid>
      <StatCard
        label={UI_COPY.DASHBOARD.KPI.NET_WORTH}
        value={<PrivacyMoney value={stats?.netWorth ?? 0} />}
        hint={UI_COPY.DASHBOARD.KPI.NET_WORTH_HINT}
      />
      <StatCard
        label={UI_COPY.DASHBOARD.KPI.MONTHLY_INCOME}
        value={<PrivacyMoney value={stats?.monthlyIncome ?? 0} />}
        trend={
          incomeChange !== null
            ? {
                value: `${Number(incomeChange) >= 0 ? "+" : ""}${incomeChange}%`,
                kind: Number(incomeChange) >= 0 ? "up" : "down",
              }
            : undefined
        }
        hint={UI_COPY.DASHBOARD.KPI.LAST_MONTH}
      />
      <StatCard
        label={UI_COPY.DASHBOARD.KPI.MONTHLY_EXPENSES}
        value={<PrivacyMoney value={stats?.monthlyExpenses ?? 0} />}
        trend={
          expenseChange !== null
            ? {
                value: `${Number(expenseChange) >= 0 ? "+" : ""}${expenseChange}%`,
                kind: Number(expenseChange) > 0 ? "down" : "up",
              }
            : undefined
        }
        hint={UI_COPY.DASHBOARD.KPI.LAST_MONTH}
      />
      <StatCard
        label={UI_COPY.DASHBOARD.KPI.SAVINGS_RATE}
        value={`${savingsRate.toFixed(1)}%`}
        trend={
          savingsRateChange !== null
            ? {
                value: `${Number(savingsRateChange) >= 0 ? "+" : ""}${savingsRateChange}%`,
                kind: Number(savingsRateChange) >= 0 ? "up" : "down",
              }
            : undefined
        }
        hint={
          stats?.netCashFlow !== undefined
            ? UI_COPY.DASHBOARD.KPI.NET(
                `${stats.netCashFlow >= 0 ? "+" : ""}${formatINR(stats.netCashFlow)}`,
              )
            : UI_COPY.DASHBOARD.KPI.LAST_MONTH
        }
      >
        <div className="bg-border/60 ml-auto h-1 w-16 shrink-0 overflow-hidden rounded-full">
          <div className="bg-primary h-full" style={{ width: `${Math.min(100, savingsRate)}%` }} />
        </div>
      </StatCard>
    </KPIGrid>
  );
}

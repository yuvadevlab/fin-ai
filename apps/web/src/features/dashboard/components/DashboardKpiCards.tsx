"use client";

import React from "react";
import { KPIGrid, StatCard } from "@finai/ui";
import { PrivacyMoney } from "@/components";
import type { DashboardStats } from "../api";

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

  return (
    <KPIGrid>
      <StatCard
        label="Net Worth"
        value={<PrivacyMoney value={stats?.netWorth ?? 0} />}
        hint="Accounts + Investments"
      />
      <StatCard
        label="Monthly Income"
        value={<PrivacyMoney value={stats?.monthlyIncome ?? 0} />}
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
        value={<PrivacyMoney value={stats?.monthlyExpenses ?? 0} />}
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
          <div className="bg-primary h-full" style={{ width: `${Math.min(100, savingsRate)}%` }} />
        </div>
      </StatCard>
    </KPIGrid>
  );
}

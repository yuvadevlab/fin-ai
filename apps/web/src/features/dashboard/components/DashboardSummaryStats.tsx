"use client";

import React from "react";
import { MiniStat } from "@finai/ui";
import { PrivacyMoney } from "@/components";
import type { DashboardStats } from "../api";

export interface DashboardSummaryStatsProps {
  stats?: DashboardStats;
}

export function DashboardSummaryStats({ stats }: DashboardSummaryStatsProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <MiniStat
        label="Investment Value"
        value={<PrivacyMoney value={stats?.netWorth ?? 0} />}
        sub="Net worth (accounts + investments)"
      />
      <MiniStat
        label="Active Goals"
        value={String(stats?.goalCount ?? 0)}
        sub={`${stats?.accountCount ?? 0} accounts linked`}
      />
      <MiniStat
        label="Net Cash Flow"
        value={<PrivacyMoney value={stats?.netCashFlow ?? 0} />}
        sub="This month"
      />
    </section>
  );
}

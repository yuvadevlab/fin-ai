"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, PieChart as PieIcon } from "lucide-react";
import { ChartCard, CategoryPie, CHART_COLORS } from "@finai/ui";
import { PrivacyMoney } from "@/components";
import type { CategoryBreakdownItem } from "../api";

export interface DashboardCategoryCardProps {
  categoryBreakdown: CategoryBreakdownItem[];
}

export function DashboardCategoryCard({ categoryBreakdown }: DashboardCategoryCardProps) {
  // Group top 4 categories and bucket the rest into "Other" to keep pie chart & list compact
  const { pieData, displayCategories, totalExpense } = useMemo(() => {
    const sorted = [...categoryBreakdown]
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
    const total = sorted.reduce((sum, c) => sum + c.total, 0);

    if (sorted.length <= 4) {
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

    const top3 = sorted.slice(0, 3);
    const otherTotal = sorted.slice(3).reduce((sum, c) => sum + c.total, 0);
    const combined = [
      ...top3.map((c) => ({
        ...c,
        percentage: total > 0 ? Math.round((c.total / total) * 100) : 0,
      })),
      {
        categoryId: "other-categories",
        name: `Other (${sorted.length - 3} more)`,
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

  return (
    <ChartCard
      title="Category Allocation"
      className="flex h-full flex-col justify-between"
      hint={
        <Link
          href="/categories"
          className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-xs font-semibold"
        >
          View all <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      }
    >
      {pieData.length > 0 && totalExpense > 0 ? (
        <div className="space-y-4">
          <CategoryPie data={pieData} />

          {/* Compact, fixed-height scrollable category breakdown */}
          <div className="border-border/60 max-h-28 space-y-2 overflow-y-auto border-t pt-2.5 pr-1">
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
                    aria-hidden="true"
                  />
                  <span className="text-foreground truncate font-medium">{c.name}</span>
                  <span className="text-muted-foreground/80 text-[10px]">({c.percentage}%)</span>
                </div>
                <PrivacyMoney value={c.total} className="text-foreground shrink-0 font-semibold" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-secondary/60 mb-3 flex size-12 items-center justify-center rounded-full">
            <PieIcon className="text-muted-foreground/60 size-6" aria-hidden="true" />
          </div>
          <p className="text-xs font-medium">No expenses logged this month</p>
          <p className="text-muted-foreground/70 mt-0.5 text-[11px]">
            Add transactions to see category distribution
          </p>
        </div>
      )}
    </ChartCard>
  );
}

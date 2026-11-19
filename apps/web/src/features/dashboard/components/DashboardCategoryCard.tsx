"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, PieChart as PieIcon } from "lucide-react";
import { ChartCard, CategoryPie, CHART_COLORS } from "@fin-ai/ui";
import { PrivacyMoney } from "@/components";
import { APP_ROUTES } from "@/lib";
import type { CategoryBreakdownItem } from "../api";
import { UI_COPY } from "@/lib/ui-copy";

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
        name: UI_COPY.CATEGORIES.OTHER_COUNT(sorted.length - 3),
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
      title={UI_COPY.DASHBOARD.CATEGORY_ALLOCATION}
      className="fn-category-chart-card"
      hint={
        <Link href={APP_ROUTES.CATEGORIES} className="fn-category-view-all-link">
          {UI_COPY.DASHBOARD.PORTFOLIO.VIEW_ALL}{" "}
          <ArrowUpRight className="fn-category-view-all-icon" aria-hidden="true" />
        </Link>
      }
    >
      {pieData.length > 0 && totalExpense > 0 ? (
        <div className="fn-category-chart-content">
          <CategoryPie data={pieData} />

          {/* Compact, fixed-height scrollable category breakdown */}
          <div className="fn-category-breakdown-list">
            {displayCategories.map((c, i) => (
              <div key={c.categoryId ?? c.name} className="fn-category-breakdown-item">
                <div className="fn-category-row-label-wrap">
                  <span
                    className="fn-category-row-dot"
                    style={{
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                    aria-hidden="true"
                  />
                  <span className="fn-category-row-name">{c.name}</span>
                  <span className="fn-category-row-pct">({c.percentage}%)</span>
                </div>
                <PrivacyMoney value={c.total} className="fn-category-row-amount" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="fn-category-empty-state">
          <div className="fn-category-empty-icon-wrap">
            <PieIcon className="fn-category-empty-icon" aria-hidden="true" />
          </div>
          <p className="fn-category-empty-title">{UI_COPY.DASHBOARD.CATEGORY_CARD.EMPTY_TITLE}</p>
          <p className="fn-category-empty-desc">
            {UI_COPY.DASHBOARD.CATEGORY_CARD.EMPTY_DESCRIPTION}
          </p>
        </div>
      )}
    </ChartCard>
  );
}

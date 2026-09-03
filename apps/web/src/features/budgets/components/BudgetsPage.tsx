"use client";

import React from "react";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader, ProgressCard, StatusBadge, Button } from "@finai/ui";

import { formatINR } from "@finai/finance-engine";
import { usePrivacyMode } from "@/hooks";
import { useBudgets } from "../api";
import { BudgetDialog } from "./BudgetDialog";

export function BudgetsPage() {
  const { isPrivacyMode } = usePrivacyMode();
  const { data: rawBudgets } = useBudgets();
  // Guard against non-array during hydration
  const budgets = Array.isArray(rawBudgets) ? rawBudgets : [];

  return (
    <PageContainer>
      <PageHeader
        title="Budgets"
        description="Monthly caps by category. AI flags categories at risk of overspend."
        actions={
          <BudgetDialog
            trigger={
              <Button size="sm" className="cursor-pointer gap-1.5">
                <Plus className="size-4" /> New Budget
              </Button>
            }
          />
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((b) => {
          const spent = b.spent ?? 0;
          const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
          const over = pct > 100;
          const warn = pct > 85 && !over;
          const status = over ? "OVER" : warn ? "NEAR_LIMIT" : "ON_TRACK";
          const name = b.category?.name || "Uncategorized";
          const diff = over ? spent - b.limit : b.limit - spent;
          const formattedDiff = isPrivacyMode ? "₹ ••••••" : formatINR(diff);

          return (
            <ProgressCard
              key={b.id}
              title={name}
              value={spent}
              target={b.limit}
              unit="₹"
              percentage={pct}
              masked={isPrivacyMode}
              progressColorClass={over ? "[&>div]:bg-destructive" : ""}
              statusBadge={<StatusBadge status={status} />}
              footerLeft={
                over ? `${formattedDiff} over limit` : `${formattedDiff} remaining this month`
              }
            />
          );
        })}
      </section>
    </PageContainer>
  );
}

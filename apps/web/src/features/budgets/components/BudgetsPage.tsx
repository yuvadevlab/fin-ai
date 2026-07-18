"use client";

import React from "react";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader, ProgressCard, StatusBadge, Button } from "@finai/ui";
import { LiveAIInsightCard } from "@/features/ai-advisor/components";
import { formatINR } from "@finai/finance-engine";
import { useBudgets } from "../api/getBudgets";
import { BudgetDialog } from "./BudgetDialog";
import { useWorkspace } from "@/providers";
import { FEATURE_FLAGS } from "@/lib/app-constants";

export function BudgetsPage() {
  const { workspaceId } = useWorkspace();
  const { data: rawBudgets } = useBudgets(workspaceId);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          {budgets.map((b) => {
            const spent = b.spent ?? 0;
            const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
            const over = pct > 100;
            const warn = pct > 85 && !over;
            const status = over ? "OVER" : warn ? "NEAR_LIMIT" : "ON_TRACK";
            const name = b.category?.name || "Uncategorized";

            return (
              <ProgressCard
                key={b.id}
                title={name}
                value={spent}
                target={b.limit}
                unit="₹"
                percentage={pct}
                progressColorClass={over ? "[&>div]:bg-destructive" : ""}
                statusBadge={<StatusBadge status={status} />}
                footerLeft={
                  over
                    ? `${formatINR(spent - b.limit)} over limit`
                    : `${formatINR(b.limit - spent)} remaining this month`
                }
              />
            );
          })}
        </section>

        {FEATURE_FLAGS.AI_INSIGHT && (
          <LiveAIInsightCard page="budgets" cta="Suggest optimisations" />
        )}
      </div>
    </PageContainer>
  );
}

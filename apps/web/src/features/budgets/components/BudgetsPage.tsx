"use client";

import React from "react";
import { Plus } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  ProgressCard,
  StatusBadge,
  AIInsightCard,
  AISuggestionsDialog,
  Button,
} from "@finai/ui";
import { formatINR } from "@finai/finance-engine";
import { useBudgets } from "../api/getBudgets";
import { BudgetDialog } from "./BudgetDialog";
import { useWorkspace } from "@/providers";

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

        <AIInsightCard
          ctaWrapper={(btn) => (
            <AISuggestionsDialog
              trigger={btn}
              title="Optimise your budgets"
              description="Small changes FinAI thinks will keep you on track this month."
              suggestions={[
                {
                  title: "Pause one streaming subscription",
                  detail:
                    "Netflix + Prime + Hotstar overlap heavily. Pausing Hotstar until IPL saves recurring spend.",
                  impact: "Save ~₹499/mo",
                },
                {
                  title: "Cap weekend food delivery to ₹500",
                  detail: "Weekend Swiggy orders are the top driver of the dining overshoot.",
                  impact: "Save ~₹1,600/mo",
                },
                {
                  title: "Shift ₹800 from Entertainment to Groceries",
                  detail: "Groceries have been within budget 3 months in a row.",
                  impact: "Rebalance ₹800",
                },
                {
                  title: "Enable auto-alert at 80%",
                  detail: "Get a nudge before you cross the cap on any category.",
                  impact: "Prevent overshoot",
                },
              ]}
            />
          )}
          body={
            <>
              You're on pace to exceed your{" "}
              <span className="text-foreground font-semibold">Entertainment</span> budget by{" "}
              <span className="text-primary font-semibold">₹800</span>. Skipping one streaming
              subscription can bring it back on track.
            </>
          }
          cta="Suggest optimisations"
        />
      </div>
    </PageContainer>
  );
}

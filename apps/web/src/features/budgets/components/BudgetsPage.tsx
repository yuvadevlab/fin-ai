"use client";

import { Plus } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  ProgressCard,
  StatusBadge,
  AIInsightCard,
  Button,
} from "@finai/ui";
import { formatINR } from "@finai/finance-engine";

// TODO: Replace with real data from API
interface Budget {
  name: string;
  spent: number;
  limit: number;
}

interface BudgetsPageProps {
  budgets: Budget[];
}

export function BudgetsPage({ budgets }: BudgetsPageProps) {
  return (
    <PageContainer>
      <PageHeader
        title="Budgets"
        description="Monthly caps by category. AI flags categories at risk of overspend."
        actions={
          <Button size="sm" className="cursor-pointer gap-1.5">
            <Plus className="size-4" /> New Budget
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          {budgets.map((b) => {
            const pct = Math.round((b.spent / b.limit) * 100);
            const over = pct > 100;
            const warn = pct > 85 && !over;
            const status = over ? "OVER" : warn ? "NEAR_LIMIT" : "ON_TRACK";

            return (
              <ProgressCard
                key={b.name}
                title={b.name}
                value={b.spent}
                target={b.limit}
                unit="₹"
                percentage={pct}
                progressColorClass={over ? "[&>div]:bg-destructive" : ""}
                statusBadge={<StatusBadge status={status} />}
                footerLeft={
                  over
                    ? `${formatINR(b.spent - b.limit)} over limit`
                    : `${formatINR(b.limit - b.spent)} remaining this month`
                }
              />
            );
          })}
        </section>

        <AIInsightCard
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

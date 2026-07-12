"use client";

import React from "react";
import { Plus, Users, User } from "lucide-react";
import { PageContainer, PageHeader, ProgressCard, Button } from "@finai/ui";
import { goals } from "@/lib/mock-data";
import { formatINR } from "@finai/finance-engine";

export default function GoalsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Savings Goals"
        description="Personal and shared family goals. FinAI projects a completion date based on your recent savings rate."
        actions={
          <Button size="sm" className="cursor-pointer gap-1.5">
            <Plus className="size-4" /> New Goal
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {goals.map((g) => {
          const pct = Math.round((g.current / g.target) * 100);
          const isFamily = g.type === "Family";

          return (
            <ProgressCard
              key={g.name}
              title={g.name}
              subtitle={
                <span className="mt-1 flex items-center gap-1.5">
                  {isFamily ? (
                    <Users className="text-muted-foreground size-3" />
                  ) : (
                    <User className="text-muted-foreground size-3" />
                  )}
                  <span>
                    {g.type} · Target {g.deadline}
                  </span>
                </span>
              }
              value={g.current}
              target={g.target}
              unit="₹"
              percentage={pct}
              statusBadge={
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {pct}%
                </span>
              }
              footerLeft={`${formatINR(g.target - g.current)} to go`}
              footerRight="On track"
            />
          );
        })}
      </section>
    </PageContainer>
  );
}

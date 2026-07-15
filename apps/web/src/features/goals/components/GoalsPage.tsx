"use client";

import React from "react";
import { Plus, Users, User, Landmark } from "lucide-react";
import { PageContainer, PageHeader, ProgressCard, Button } from "@finai/ui";
import { formatINR } from "@finai/finance-engine";
import { useGoals } from "../api/getGoals";
import { GoalDialog } from "./GoalDialog";
import { ContributeDialog } from "./ContributeDialog";
import { useWorkspace } from "@/providers";

export function GoalsPage() {
  const { workspaceId } = useWorkspace();
  const { data: rawGoals } = useGoals(workspaceId);
  // Guard against non-array during hydration
  const goals = Array.isArray(rawGoals) ? rawGoals : [];

  return (
    <PageContainer>
      <PageHeader
        title="Savings Goals"
        description="Personal and shared family goals. FinAI projects a completion date based on your recent savings rate."
        actions={
          <GoalDialog
            trigger={
              <Button size="sm" className="cursor-pointer gap-1.5">
                <Plus className="size-4" /> New Goal
              </Button>
            }
          />
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {goals.map((g) => {
          const target = g.targetAmount ?? 0;
          const current = g.currentAmount ?? 0;
          const pct = target > 0 ? Math.round((current / target) * 100) : 0;
          const isFamily = g.type === "FAMILY";
          const formattedDeadline = new Date(g.deadline).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <ProgressCard
              key={g.id}
              title={g.name}
              subtitle={
                <span className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                  {isFamily ? <Users className="size-3" /> : <User className="size-3" />}
                  <span>
                    {isFamily ? "Family Goal" : "Personal Goal"} · Target: {formattedDeadline}
                  </span>
                </span>
              }
              value={current}
              target={target}
              unit="₹"
              percentage={pct}
              statusBadge={
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {pct}%
                </span>
              }
              footerLeft={
                current >= target ? "Goal Completed!" : `${formatINR(target - current)} to go`
              }
              footerRight={
                current >= target ? null : (
                  <ContributeDialog
                    goalId={g.id}
                    goalName={g.name}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-primary h-7 cursor-pointer text-xs font-semibold"
                      >
                        <Landmark className="mr-1 size-3" /> Save
                      </Button>
                    }
                  />
                )
              }
            />
          );
        })}
      </section>
    </PageContainer>
  );
}

"use client";

import React, { useState } from "react";
import { Plus, Target, Landmark, Pencil, Trash2, MoreVertical } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  ProgressCard,
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@finai/ui";
import { formatINR } from "@finai/finance-engine";
import { usePrivacyMode } from "@/hooks";

import { useGoals, useDeleteGoal, type Goal } from "../api";
import { GoalDialog } from "./GoalDialog";
import { ContributeDialog } from "./ContributeDialog";

export function GoalsPage() {
  const { isPrivacyMode } = usePrivacyMode();
  const { data: rawGoals } = useGoals();
  // Guard against non-array during hydration
  const goals = Array.isArray(rawGoals) ? rawGoals : [];

  const [formOpen, setFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const deleteGoal = useDeleteGoal();

  const handleOpenCreateGoal = () => {
    setSelectedGoal(null);
    setFormOpen(true);
  };

  const handleOpenEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormOpen(true);
  };

  const handleOpenDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal);
    setDeleteOpen(true);
  };

  const handleDeleteGoalConfirm = async () => {
    if (!goalToDelete) return;
    try {
      await deleteGoal.mutateAsync(goalToDelete.id);
      setDeleteOpen(false);
      setGoalToDelete(null);
    } catch {
      // Toast displays error from mutation
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Savings Goals"
        description="Track your personal savings targets and projected completion dates."
        actions={
          <Button size="sm" onClick={handleOpenCreateGoal} className="cursor-pointer gap-1.5">
            <Plus className="size-4" /> New Goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <div className="bg-card border-border flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm">
          <div className="bg-secondary mb-4 flex size-12 items-center justify-center rounded-2xl">
            <Target className="text-muted-foreground size-6" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No savings goals yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Set targets for an Emergency Fund, vacations, or major purchases to keep your savings on
            track.
          </p>
          <Button size="sm" onClick={handleOpenCreateGoal} className="mt-5 cursor-pointer gap-1.5">
            <Plus className="size-4" /> Create First Goal
          </Button>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const target = g.targetAmount ?? 0;
            const current = g.currentAmount ?? 0;
            const pct = target > 0 ? Math.round((current / target) * 100) : 0;
            const formattedDeadline = g.deadline
              ? new Date(g.deadline).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "No deadline";

            return (
              <ProgressCard
                key={g.id}
                title={g.name}
                subtitle={
                  <span className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                    <Target className="size-3" />
                    <span>Target: {formattedDeadline}</span>
                  </span>
                }
                value={current}
                target={target}
                unit="₹"
                percentage={pct}
                masked={isPrivacyMode}
                statusBadge={
                  <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-bold">
                    {pct}%
                  </span>
                }
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
                        aria-label={`Actions for ${g.name}`}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => handleOpenEditGoal(g)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 size-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleOpenDeleteGoal(g)}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 size-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
                footerLeft={
                  current >= target
                    ? "Goal Completed!"
                    : `${isPrivacyMode ? "₹ ••••••" : formatINR(target - current)} to go`
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
      )}

      {/* Add / Edit Goal Dialog */}
      <GoalDialog open={formOpen} onOpenChange={setFormOpen} goal={selectedGoal ?? undefined} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Goal"
        description={`Are you sure you want to delete the goal "${goalToDelete?.name ?? "this goal"}"? Your transactions will remain intact, but goal tracking will be removed.`}
        confirmText="Delete Goal"
        destructive
        onConfirm={handleDeleteGoalConfirm}
      />
    </PageContainer>
  );
}

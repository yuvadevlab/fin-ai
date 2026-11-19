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
} from "@fin-ai/ui";
import { formatINR } from "@fin-ai/finance-engine";
import { usePrivacyMode } from "@/hooks";
import { UI_COPY } from "@/lib/ui-copy";

import { useWorkspace } from "@/providers";
import { ReadOnlyWorkspaceBanner } from "@/components";
import { useGoals, useDeleteGoal, type Goal } from "../api";
import { GoalDialog } from "./GoalDialog";
import { ContributeDialog } from "./ContributeDialog";

export function GoalsPage() {
  const { isReadOnly } = useWorkspace();
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
        title={UI_COPY.GOALS.PAGE_TITLE}
        description={UI_COPY.GOALS.PAGE_DESCRIPTION}
        actions={
          isReadOnly ? undefined : (
            <Button size="sm" onClick={handleOpenCreateGoal} className="fn-header-action-btn">
              <Plus className="fn-icon-md" /> {UI_COPY.GOALS.NEW_GOAL}
            </Button>
          )
        }
      />

      {isReadOnly && <ReadOnlyWorkspaceBanner />}

      {goals.length === 0 ? (
        <div className="fn-entity-empty">
          <div className="fn-entity-empty-icon">
            <Target className="fn-entity-empty-icon-svg" />
          </div>
          <h3 className="fn-entity-empty-title">{UI_COPY.GOALS.EMPTY_TITLE}</h3>
          <p className="fn-entity-empty-desc">{UI_COPY.GOALS.EMPTY_DESCRIPTION}</p>
          {!isReadOnly && (
            <Button size="sm" onClick={handleOpenCreateGoal} className="fn-entity-empty-btn">
              <Plus className="fn-icon-md" /> {UI_COPY.GOALS.CREATE_FIRST}
            </Button>
          )}
        </div>
      ) : (
        <section className="fn-entity-grid">
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
              : UI_COPY.GOALS.NO_DEADLINE;

            return (
              <ProgressCard
                key={g.id}
                title={g.name}
                subtitle={
                  <span className="fn-goal-subtitle">
                    <Target className="fn-goal-icon-sm" />
                    <span>
                      {UI_COPY.GOALS.TARGET} {formattedDeadline}
                    </span>
                  </span>
                }
                value={current}
                target={target}
                unit="₹"
                percentage={pct}
                masked={isPrivacyMode}
                statusBadge={<span className="fn-goal-badge">{pct}%</span>}
                actions={
                  isReadOnly ? undefined : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="fn-goal-menu-trigger"
                          aria-label={UI_COPY.GOALS.ACTIONS_FOR(g.name)}
                        >
                          <MoreVertical className="fn-icon-md" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="fn-goal-menu-content">
                        <DropdownMenuItem
                          onClick={() => handleOpenEditGoal(g)}
                          className="fn-goal-menu-item"
                        >
                          <Pencil className="fn-goal-menu-icon" /> {UI_COPY.COMMON.ACTIONS.EDIT}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDeleteGoal(g)}
                          className="fn-goal-menu-item-destructive"
                        >
                          <Trash2 className="fn-goal-menu-icon" /> {UI_COPY.COMMON.ACTIONS.DELETE}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }
                footerLeft={
                  current >= target
                    ? UI_COPY.GOALS.COMPLETED
                    : `${isPrivacyMode ? "₹ ••••••" : formatINR(target - current)} ${UI_COPY.GOALS.TO_GO}`
                }
                footerRight={
                  isReadOnly || current >= target ? null : (
                    <ContributeDialog
                      goalId={g.id}
                      goalName={g.name}
                      trigger={
                        <Button variant="ghost" size="sm" className="fn-goal-save-btn">
                          <Landmark className="fn-goal-icon-sm" />{" "}
                          {UI_COPY.COMMON.ACTIONS.SAVE_SHORT}
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
        title={UI_COPY.GOALS.DELETE_TITLE}
        description={UI_COPY.GOALS.DELETE_CONFIRMATION(goalToDelete?.name ?? "this goal")}
        confirmText={UI_COPY.GOALS.DELETE_TITLE}
        destructive
        onConfirm={handleDeleteGoalConfirm}
      />
    </PageContainer>
  );
}

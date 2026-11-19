"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, PiggyBank, MoreVertical } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  ProgressCard,
  StatusBadge,
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@fin-ai/ui";
import {
  formatINR,
  calculateBudgetStatus,
  calculateBudgetUsage,
  calculateBudgetRemaining,
} from "@fin-ai/finance-engine";
import { BudgetStatus } from "@fin-ai/shared-types";
import { usePrivacyMode } from "@/hooks";
import { useWorkspace } from "@/providers";
import { useBudgets, useDeleteBudget, type Budget } from "../api";
import { BudgetDialog } from "./BudgetDialog";
import { ReadOnlyWorkspaceBanner } from "@/components";
import { UI_COPY } from "@/lib/ui-copy";

export function BudgetsPage() {
  const { isReadOnly } = useWorkspace();
  const { isPrivacyMode } = usePrivacyMode();
  const { data: rawBudgets } = useBudgets();
  // Guard against non-array during hydration
  const budgets = Array.isArray(rawBudgets) ? rawBudgets : [];

  const [formOpen, setFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const deleteBudget = useDeleteBudget();

  const handleOpenCreateBudget = () => {
    setSelectedBudget(null);
    setFormOpen(true);
  };

  const handleOpenEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormOpen(true);
  };

  const handleOpenDeleteBudget = (budget: Budget) => {
    setBudgetToDelete(budget);
    setDeleteOpen(true);
  };

  const handleDeleteBudgetConfirm = async () => {
    if (!budgetToDelete) return;
    try {
      await deleteBudget.mutateAsync(budgetToDelete.id);
      setDeleteOpen(false);
      setBudgetToDelete(null);
    } catch {
      // Toast displays error from mutation
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={UI_COPY.BUDGETS.PAGE_TITLE}
        description={UI_COPY.BUDGETS.PAGE_DESCRIPTION}
        actions={
          isReadOnly ? undefined : (
            <Button size="sm" onClick={handleOpenCreateBudget} className="fn-header-action-btn">
              <Plus className="size-4" /> {UI_COPY.BUDGETS.NEW_BUDGET}
            </Button>
          )
        }
      />

      {isReadOnly && <ReadOnlyWorkspaceBanner />}

      {budgets.length === 0 ? (
        <div className="fn-entity-empty">
          <div className="fn-entity-empty-icon">
            <PiggyBank className="fn-entity-empty-icon-svg" />
          </div>
          <h3 className="fn-entity-empty-title">{UI_COPY.BUDGETS.EMPTY_TITLE}</h3>
          <p className="fn-entity-empty-desc">{UI_COPY.BUDGETS.EMPTY_DESCRIPTION}</p>
          {!isReadOnly && (
            <Button size="sm" onClick={handleOpenCreateBudget} className="fn-entity-empty-btn">
              <Plus className="size-4" /> {UI_COPY.BUDGETS.CREATE_FIRST}
            </Button>
          )}
        </div>
      ) : (
        <section className="fn-entity-grid">
          {budgets.map((b) => {
            const spent = b.spent ?? 0;
            const status = (b.status as BudgetStatus) || calculateBudgetStatus(spent, b.limit);
            const isOver = status === BudgetStatus.OVER;
            const isAtLimit = status === BudgetStatus.AT_LIMIT;
            const isWarn = status === BudgetStatus.NEAR_LIMIT;
            const pct = calculateBudgetUsage(spent, b.limit);
            const name = b.category?.name || "Uncategorized";
            const diff = calculateBudgetRemaining(spent, b.limit);
            const formattedDiff = isPrivacyMode ? "₹ ••••••" : formatINR(Math.abs(diff));

            const footerText = isOver
              ? `${formattedDiff} ${UI_COPY.BUDGETS.OVER_LIMIT}`
              : isAtLimit
                ? isPrivacyMode
                  ? UI_COPY.BUDGETS.FULLY_SPENT_MASKED
                  : UI_COPY.BUDGETS.FULLY_SPENT_REMAINING
                : `${formattedDiff} ${UI_COPY.BUDGETS.REMAINING_THIS_MONTH}`;

            const progressColorClass = isOver ? "is-over" : isAtLimit || isWarn ? "is-warn" : "";

            return (
              <ProgressCard
                key={b.id}
                title={name}
                value={spent}
                target={b.limit}
                unit="₹"
                percentage={pct}
                masked={isPrivacyMode}
                progressColorClass={progressColorClass}
                statusBadge={<StatusBadge status={status} />}
                actions={
                  isReadOnly ? undefined : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="fn-goal-menu-trigger"
                          aria-label={UI_COPY.BUDGETS.ACTIONS_FOR(name)}
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="fn-goal-menu-content">
                        <DropdownMenuItem
                          onClick={() => handleOpenEditBudget(b)}
                          className="fn-goal-menu-item"
                        >
                          <Pencil className="fn-goal-menu-icon" /> {UI_COPY.COMMON.ACTIONS.EDIT}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDeleteBudget(b)}
                          className="fn-goal-menu-item-destructive"
                        >
                          <Trash2 className="fn-goal-menu-icon" /> {UI_COPY.COMMON.ACTIONS.DELETE}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }
                footerLeft={footerText}
              />
            );
          })}
        </section>
      )}

      {/* Add / Edit Budget Dialog */}
      <BudgetDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        budget={selectedBudget ?? undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={UI_COPY.BUDGETS.DELETE_TITLE}
        description={UI_COPY.BUDGETS.DELETE_CONFIRMATION(
          budgetToDelete?.category?.name ?? "this category",
        )}
        confirmText={UI_COPY.BUDGETS.DELETE_TITLE}
        destructive
        onConfirm={handleDeleteBudgetConfirm}
      />
    </PageContainer>
  );
}

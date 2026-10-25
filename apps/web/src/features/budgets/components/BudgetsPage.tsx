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
} from "@finai/ui";
import {
  formatINR,
  calculateBudgetStatus,
  calculateBudgetUsage,
  calculateBudgetRemaining,
} from "@finai/finance-engine";
import { BudgetStatus } from "@finai/shared-types";
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
            <Button size="sm" onClick={handleOpenCreateBudget} className="cursor-pointer gap-1.5">
              <Plus className="size-4" /> {UI_COPY.BUDGETS.NEW_BUDGET}
            </Button>
          )
        }
      />

      {isReadOnly && <ReadOnlyWorkspaceBanner />}

      {budgets.length === 0 ? (
        <div className="bg-card border-border flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm">
          <div className="bg-secondary mb-4 flex size-12 items-center justify-center rounded-2xl">
            <PiggyBank className="text-muted-foreground size-6" />
          </div>
          <h3 className="text-foreground text-base font-semibold">{UI_COPY.BUDGETS.EMPTY_TITLE}</h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            {UI_COPY.BUDGETS.EMPTY_DESCRIPTION}
          </p>
          {!isReadOnly && (
            <Button
              size="sm"
              onClick={handleOpenCreateBudget}
              className="mt-5 cursor-pointer gap-1.5"
            >
              <Plus className="size-4" /> {UI_COPY.BUDGETS.CREATE_FIRST}
            </Button>
          )}
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

            const progressColorClass = isOver
              ? "[&>div]:bg-destructive"
              : isAtLimit || isWarn
                ? "[&>div]:bg-amber-500"
                : "";

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
                          className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
                          aria-label={UI_COPY.BUDGETS.ACTIONS_FOR(name)}
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          onClick={() => handleOpenEditBudget(b)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 size-3.5" /> {UI_COPY.COMMON.ACTIONS.EDIT}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDeleteBudget(b)}
                          className="text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 size-3.5" /> {UI_COPY.COMMON.ACTIONS.DELETE}
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

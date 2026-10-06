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
import { useBudgets, useDeleteBudget, type Budget } from "../api";
import { BudgetDialog } from "./BudgetDialog";

export function BudgetsPage() {
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
        title="Budgets"
        description="Monthly caps by category. AI flags categories at risk of overspend."
        actions={
          <Button size="sm" onClick={handleOpenCreateBudget} className="cursor-pointer gap-1.5">
            <Plus className="size-4" /> New Budget
          </Button>
        }
      />

      {budgets.length === 0 ? (
        <div className="bg-card border-border flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm">
          <div className="bg-secondary mb-4 flex size-12 items-center justify-center rounded-2xl">
            <PiggyBank className="text-muted-foreground size-6" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No budgets set yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Set monthly spending caps on categories like Groceries, Dining Out, or Entertainment to
            keep your expenses on track.
          </p>
          <Button
            size="sm"
            onClick={handleOpenCreateBudget}
            className="mt-5 cursor-pointer gap-1.5"
          >
            <Plus className="size-4" /> Create First Budget
          </Button>
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
              ? `${formattedDiff} over limit`
              : isAtLimit
                ? isPrivacyMode
                  ? "Fully spent · ₹ ••••••"
                  : "Fully spent · ₹0 left"
                : `${formattedDiff} remaining this month`;

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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
                        aria-label={`Actions for ${name} budget`}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => handleOpenEditBudget(b)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 size-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleOpenDeleteBudget(b)}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 size-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        title="Delete Budget"
        description={`Are you sure you want to remove the budget for "${budgetToDelete?.category?.name ?? "this category"}"? Your transactions will remain intact, but budget tracking for this category will stop.`}
        confirmText="Delete Budget"
        destructive
        onConfirm={handleDeleteBudgetConfirm}
      />
    </PageContainer>
  );
}

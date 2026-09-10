"use client";

import React from "react";
import { CategoryDialog } from "@/features/categories/components/CategoryDialog";
import { AccountDialog } from "@/features/accounts/components/AccountDialog";
import { InvestmentDialog } from "@/features/investments/components/InvestmentDialog";
import { GoalDialog } from "@/features/goals/components/GoalDialog";
import type { Investment } from "@/features/investments/api";
import type { Goal } from "@/features/goals/api";

export interface InlineEntityDialogsProps {
  isAddCategoryOpen: boolean;
  onCategoryOpenChange: (open: boolean) => void;
  addCategoryInitialName?: string;
  onCategoryCreated: (category: { id: string; name: string }) => void;

  isAddAccountOpen: boolean;
  onAccountOpenChange: (open: boolean) => void;
  addAccountInitialName?: string;
  onAccountCreated: (account: { id: string; name: string }) => void;

  isAddInvestmentOpen?: boolean;
  onInvestmentOpenChange?: (open: boolean) => void;
  addInvestmentInitialName?: string;
  onInvestmentCreated?: (investment: Investment) => void;

  isAddGoalOpen?: boolean;
  onGoalOpenChange?: (open: boolean) => void;
  addGoalInitialName?: string;
  onGoalCreated?: (goal: Goal) => void;
}

export function InlineEntityDialogs({
  isAddCategoryOpen,
  onCategoryOpenChange,
  addCategoryInitialName = "",
  onCategoryCreated,
  isAddAccountOpen,
  onAccountOpenChange,
  addAccountInitialName = "",
  onAccountCreated,
  isAddInvestmentOpen = false,
  onInvestmentOpenChange = () => {},
  addInvestmentInitialName = "",
  onInvestmentCreated = () => {},
  isAddGoalOpen = false,
  onGoalOpenChange = () => {},
  addGoalInitialName = "",
  onGoalCreated = () => {},
}: InlineEntityDialogsProps) {
  return (
    <>
      <CategoryDialog
        open={isAddCategoryOpen}
        onOpenChange={onCategoryOpenChange}
        initialName={addCategoryInitialName}
        onSuccess={onCategoryCreated}
      />

      <AccountDialog
        open={isAddAccountOpen}
        onOpenChange={onAccountOpenChange}
        initialName={addAccountInitialName}
        onSuccess={onAccountCreated}
      />

      <InvestmentDialog
        open={isAddInvestmentOpen}
        onOpenChange={onInvestmentOpenChange}
        initialName={addInvestmentInitialName}
        onSuccess={onInvestmentCreated}
      />

      <GoalDialog
        open={isAddGoalOpen}
        onOpenChange={onGoalOpenChange}
        initialName={addGoalInitialName}
        onSuccess={onGoalCreated}
      />
    </>
  );
}

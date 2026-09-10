"use client";

import { useState } from "react";
import type { Investment } from "@/features/investments/api";
import type { Goal } from "@/features/goals/api";

export interface InlineEntityCreationOptions {
  onCategoryCreated?: (category: { id: string; name: string }, targetRowId?: string | null) => void;
  onAccountCreated?: (account: { id: string; name: string }, targetRowId?: string | null) => void;
  onInvestmentCreated?: (investment: Investment) => void;
  onGoalCreated?: (goal: Goal) => void;
}

export function useInlineEntityCreation(options?: InlineEntityCreationOptions) {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [addCategoryInitialName, setAddCategoryInitialName] = useState("");
  const [targetCategoryRowId, setTargetCategoryRowId] = useState<string | null>(null);

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [addAccountInitialName, setAddAccountInitialName] = useState("");
  const [targetAccountRowId, setTargetAccountRowId] = useState<string | null>(null);

  const [isAddInvestmentOpen, setIsAddInvestmentOpen] = useState(false);
  const [addInvestmentInitialName, setAddInvestmentInitialName] = useState("");

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [addGoalInitialName, setAddGoalInitialName] = useState("");

  const openAddCategory = (initialName?: string, rowId?: string) => {
    setAddCategoryInitialName(initialName || "");
    setTargetCategoryRowId(rowId || null);
    setIsAddCategoryOpen(true);
  };

  const handleCategoryCreated = (createdCategory: { id: string; name: string }) => {
    options?.onCategoryCreated?.(createdCategory, targetCategoryRowId);
    setIsAddCategoryOpen(false);
  };

  const openAddAccount = (initialName?: string, rowId?: string) => {
    setAddAccountInitialName(initialName || "");
    setTargetAccountRowId(rowId || null);
    setIsAddAccountOpen(true);
  };

  const handleAccountCreated = (createdAccount: { id: string; name: string }) => {
    options?.onAccountCreated?.(createdAccount, targetAccountRowId);
    setIsAddAccountOpen(false);
  };

  const openAddInvestment = (initialName?: string) => {
    setAddInvestmentInitialName(initialName || "");
    setIsAddInvestmentOpen(true);
  };

  const handleInvestmentCreated = (created: Investment) => {
    options?.onInvestmentCreated?.(created);
    setIsAddInvestmentOpen(false);
  };

  const openAddGoal = (initialName?: string) => {
    setAddGoalInitialName(initialName || "");
    setIsAddGoalOpen(true);
  };

  const handleGoalCreated = (created: Goal) => {
    options?.onGoalCreated?.(created);
    setIsAddGoalOpen(false);
  };

  return {
    // Category state & handlers
    isAddCategoryOpen,
    setIsAddCategoryOpen,
    addCategoryInitialName,
    openAddCategory,
    handleCategoryCreated,

    // Account state & handlers
    isAddAccountOpen,
    setIsAddAccountOpen,
    addAccountInitialName,
    openAddAccount,
    handleAccountCreated,

    // Investment state & handlers
    isAddInvestmentOpen,
    setIsAddInvestmentOpen,
    addInvestmentInitialName,
    openAddInvestment,
    handleInvestmentCreated,

    // Goal state & handlers
    isAddGoalOpen,
    setIsAddGoalOpen,
    addGoalInitialName,
    openAddGoal,
    handleGoalCreated,
  };
}

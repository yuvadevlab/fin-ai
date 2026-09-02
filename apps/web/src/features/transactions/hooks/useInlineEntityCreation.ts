"use client";

import { useState } from "react";

export interface InlineEntityCreationOptions {
  onCategoryCreated?: (category: { id: string; name: string }, targetRowId?: string | null) => void;
  onAccountCreated?: (account: { id: string; name: string }, targetRowId?: string | null) => void;
}

export function useInlineEntityCreation(options?: InlineEntityCreationOptions) {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [addCategoryInitialName, setAddCategoryInitialName] = useState("");
  const [targetCategoryRowId, setTargetCategoryRowId] = useState<string | null>(null);

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [addAccountInitialName, setAddAccountInitialName] = useState("");
  const [targetAccountRowId, setTargetAccountRowId] = useState<string | null>(null);

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
  };
}

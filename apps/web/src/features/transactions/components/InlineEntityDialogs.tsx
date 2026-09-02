"use client";

import React from "react";
import { CategoryDialog } from "@/features/categories/components/CategoryDialog";
import { AccountDialog } from "@/features/accounts/components/AccountDialog";

export interface InlineEntityDialogsProps {
  isAddCategoryOpen: boolean;
  onCategoryOpenChange: (open: boolean) => void;
  addCategoryInitialName?: string;
  onCategoryCreated: (category: { id: string; name: string }) => void;

  isAddAccountOpen: boolean;
  onAccountOpenChange: (open: boolean) => void;
  addAccountInitialName?: string;
  onAccountCreated: (account: { id: string; name: string }) => void;
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
    </>
  );
}

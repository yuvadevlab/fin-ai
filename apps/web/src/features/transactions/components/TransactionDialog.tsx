"use client";

import React, { useState, useMemo } from "react";
import { FormDialog } from "@finai/ui";
import { useAccounts } from "@/features/accounts/api";
import { useCategories } from "@/features/categories/api";
import {
  useInlineEntityCreation,
  useTransactionDialogForm,
  type TransactionInitialValues,
} from "../hooks";
import { TransactionForm } from "./TransactionForm";
import { InlineEntityDialogs } from "./InlineEntityDialogs";
import { BulkTransactionDialog } from "./BulkTransactionDialog";

export interface TransactionDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "add" | "edit";
  transactionId?: string; // Passed in edit mode
  initialValues?: TransactionInitialValues;
}

export function TransactionDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  mode = "add",
  transactionId,
  initialValues,
}: TransactionDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : localOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setLocalOpen;

  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Queries for select dropdown options
  const { data: accountsData } = useAccounts();
  const { data: categoriesData } = useCategories();

  const accountsOptions = useMemo(() => {
    return (accountsData || []).map((acc) => ({
      label: `${acc.name} (${acc.type.replace("_", " ")})`,
      value: acc.id,
    }));
  }, [accountsData]);

  const categoriesOptions = useMemo(() => {
    return (categoriesData || []).map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));
  }, [categoriesData]);

  const { values, errors, handleChange, handleSubmit, isSaving } = useTransactionDialogForm({
    open,
    setOpen,
    mode,
    transactionId,
    initialValues,
  });

  const {
    isAddCategoryOpen,
    setIsAddCategoryOpen,
    addCategoryInitialName,
    openAddCategory,
    handleCategoryCreated,
    isAddAccountOpen,
    setIsAddAccountOpen,
    addAccountInitialName,
    openAddAccount,
    handleAccountCreated,
  } = useInlineEntityCreation({
    onCategoryCreated: (createdCategory) => handleChange("category", createdCategory.id),
    onAccountCreated: (createdAccount) => handleChange("account", createdAccount.id),
  });

  const handleSwitchToBulk = () => {
    setOpen?.(false);
    setIsBulkOpen(true);
  };

  const title = mode === "add" ? "Add Transaction" : "Edit Transaction";
  const description =
    mode === "add" ? "Log a new expense, income or transfer." : "Update transaction details.";
  const submitLabel = mode === "add" ? "Save Transaction" : "Update Transaction";

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        title={title}
        description={description}
        submitLabel={submitLabel}
        loading={isSaving}
        onCancel={() => setOpen?.(false)}
        onSubmit={handleSubmit}
      >
        {mode === "add" && (
          <div className="bg-secondary/50 mb-4 flex items-center justify-between rounded-xl p-2.5 text-xs">
            <span className="text-muted-foreground font-semibold">
              Have multiple transactions to log or import from Excel?
            </span>
            <button
              type="button"
              onClick={handleSwitchToBulk}
              className="text-primary cursor-pointer font-bold hover:underline"
            >
              Switch to Bulk Import & Upload Mode →
            </button>
          </div>
        )}
        {errors.root && (
          <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
            {errors.root}
          </div>
        )}
        <TransactionForm
          values={values}
          errors={errors}
          onChange={handleChange}
          accounts={accountsOptions}
          categories={categoriesOptions}
          onAddCategory={openAddCategory}
          onAddAccount={openAddAccount}
        />
      </FormDialog>

      <BulkTransactionDialog
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        accounts={accountsOptions}
        categories={categoriesOptions}
      />

      <InlineEntityDialogs
        isAddCategoryOpen={isAddCategoryOpen}
        onCategoryOpenChange={setIsAddCategoryOpen}
        addCategoryInitialName={addCategoryInitialName}
        onCategoryCreated={handleCategoryCreated}
        isAddAccountOpen={isAddAccountOpen}
        onAccountOpenChange={setIsAddAccountOpen}
        addAccountInitialName={addAccountInitialName}
        onAccountCreated={handleAccountCreated}
      />
    </>
  );
}

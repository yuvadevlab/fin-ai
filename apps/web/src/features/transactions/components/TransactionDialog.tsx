"use client";

import React, { useState, useMemo } from "react";
import { FormDialog } from "@fin-ai/ui";
import { useAccounts } from "@/features/accounts/api";
import { useCategories } from "@/features/categories/api";
import { useInvestments } from "@/features/investments/api";
import { useGoals } from "@/features/goals/api";
import {
  useInlineEntityCreation,
  useTransactionDialogForm,
  type TransactionInitialValues,
} from "../hooks";
import { TransactionForm } from "./TransactionForm";
import { InlineEntityDialogs } from "./InlineEntityDialogs";
import { BulkTransactionDialog } from "./BulkTransactionDialog";
import { UI_COPY } from "@/lib/ui-copy";

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
  const { data: rawInvestments } = useInvestments();
  const { data: rawGoals } = useGoals();

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

  const investmentsOptions = useMemo(() => {
    const list =
      rawInvestments && Array.isArray(rawInvestments.investments) ? rawInvestments.investments : [];
    return list.map((inv) => ({
      label: `${inv.name} (Invested: ₹${(inv.investedAmount ?? 0).toLocaleString("en-IN")})`,
      value: inv.id,
    }));
  }, [rawInvestments]);

  const goalsOptions = useMemo(() => {
    return (rawGoals || []).map((g) => ({
      label: `${g.name} (Target: ₹${(g.targetAmount ?? 0).toLocaleString("en-IN")})`,
      value: g.id,
    }));
  }, [rawGoals]);

  // Resolve the default account — explicit default or auto-select when only 1 account
  const defaultAccountId = useMemo(() => {
    const accounts = accountsData || [];
    return (
      accounts.find((a) => a.isDefault)?.id ?? (accounts.length === 1 ? accounts[0].id : undefined)
    );
  }, [accountsData]);

  const { values, errors, handleChange, handleSubmit, isSaving } = useTransactionDialogForm({
    open,
    setOpen,
    mode,
    transactionId,
    initialValues,
    defaultAccountId,
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
    isAddInvestmentOpen,
    setIsAddInvestmentOpen,
    addInvestmentInitialName,
    openAddInvestment,
    handleInvestmentCreated,
    isAddGoalOpen,
    setIsAddGoalOpen,
    addGoalInitialName,
    openAddGoal,
    handleGoalCreated,
  } = useInlineEntityCreation({
    onCategoryCreated: (createdCategory) => handleChange("category", createdCategory.id),
    onAccountCreated: (createdAccount) => handleChange("account", createdAccount.id),
    onInvestmentCreated: (created) => handleChange("investmentId", created.id),
    onGoalCreated: (created) => handleChange("goalId", created.id),
  });

  const handleSwitchToBulk = () => {
    setOpen?.(false);
    setIsBulkOpen(true);
  };

  const title = mode === "add" ? UI_COPY.TRANSACTIONS.ADD_TITLE : UI_COPY.TRANSACTIONS.EDIT_TITLE;
  const description =
    mode === "add" ? UI_COPY.TRANSACTIONS.ADD_DESCRIPTION : UI_COPY.TRANSACTIONS.EDIT_DESCRIPTION;
  const submitLabel =
    mode === "add" ? UI_COPY.TRANSACTIONS.SAVE_LABEL : UI_COPY.TRANSACTIONS.UPDATE_LABEL;

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
        className="fn-dialog-content--single"
        onCancel={() => setOpen?.(false)}
        onSubmit={handleSubmit}
      >
        {mode === "add" && (
          <div className="fn-tx-bulk-banner">
            <span className="fn-tx-bulk-banner-text">{UI_COPY.TRANSACTIONS.BULK_PROMPT}</span>
            <button type="button" onClick={handleSwitchToBulk} className="fn-tx-bulk-banner-btn">
              {UI_COPY.TRANSACTIONS.SWITCH_TO_BULK}
            </button>
          </div>
        )}
        {errors.root && <div className="fn-form-error-banner">{errors.root}</div>}
        <TransactionForm
          values={values}
          errors={errors}
          onChange={handleChange}
          accounts={accountsOptions}
          categories={categoriesOptions}
          investments={investmentsOptions}
          goals={goalsOptions}
          onAddCategory={openAddCategory}
          onAddAccount={openAddAccount}
          onAddInvestment={openAddInvestment}
          onAddGoal={openAddGoal}
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
        isAddInvestmentOpen={isAddInvestmentOpen}
        onInvestmentOpenChange={setIsAddInvestmentOpen}
        addInvestmentInitialName={addInvestmentInitialName}
        onInvestmentCreated={handleInvestmentCreated}
        isAddGoalOpen={isAddGoalOpen}
        onGoalOpenChange={setIsAddGoalOpen}
        addGoalInitialName={addGoalInitialName}
        onGoalCreated={handleGoalCreated}
      />
    </>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { FormDialog } from "@finai/ui";
import { clientTransactionSchema } from "@finai/validation";
import { TransactionForm } from "./TransactionForm";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { useAccounts } from "../../accounts/api/getAccounts";
import { useCategories } from "../../categories/api/getCategories";
import { useCreateTransaction } from "../api/createTransaction";
import { useUpdateTransaction } from "../api/updateTransaction";

export interface TransactionDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "add" | "edit";
  transactionId?: string; // Passed in edit mode
  initialValues?: {
    id?: string;
    amount?: number | string;
    merchant?: string;
    type?: string;
    kind?: string;
    categoryId?: string;
    category?: string | { id: string; name: string; group: string };
    accountId?: string;
    account?: string | { id: string; name: string; type: string };
    toAccountId?: string | null;
    toAccount?: string | { id: string; name: string; type: string } | null;
    date?: string;
    notes?: string | null;
  };
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

  const { activeWorkspaceId } = useActiveWorkspace();

  // Queries for select dropdown options
  const { data: accountsData } = useAccounts(activeWorkspaceId);
  const { data: categoriesData } = useCategories(activeWorkspaceId);

  // Mutations
  const createTransaction = useCreateTransaction(activeWorkspaceId);
  const updateTransaction = useUpdateTransaction(activeWorkspaceId);

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

  const getFormInitialValues = () => {
    return {
      amount: initialValues?.amount !== undefined ? String(initialValues.amount) : "",
      merchant: initialValues?.merchant ?? "",
      kind:
        initialValues?.kind ?? (initialValues?.type ? initialValues.type.toLowerCase() : "expense"),
      category:
        (initialValues?.category && typeof initialValues.category === "object"
          ? initialValues.category.id
          : (initialValues?.category as string | undefined)) ??
        initialValues?.categoryId ??
        "",
      account:
        (initialValues?.account && typeof initialValues.account === "object"
          ? initialValues.account.id
          : (initialValues?.account as string | undefined)) ??
        initialValues?.accountId ??
        "",
      toAccount:
        (initialValues?.toAccount && typeof initialValues.toAccount === "object"
          ? initialValues.toAccount.id
          : (initialValues?.toAccount as string | undefined)) ??
        initialValues?.toAccountId ??
        "",
      date: initialValues?.date
        ? new Date(initialValues.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: initialValues?.notes ?? "",
    };
  };

  const [values, setValues] = useState<Record<string, string>>(getFormInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialValuesKey, setPrevInitialValuesKey] = useState(() =>
    JSON.stringify(initialValues),
  );

  const currentInitialValuesKey = JSON.stringify(initialValues);

  if (open !== prevOpen || currentInitialValuesKey !== prevInitialValuesKey) {
    setPrevOpen(open);
    setPrevInitialValuesKey(currentInitialValuesKey);
    if (open) {
      setValues(getFormInitialValues());
      setErrors({});
    }
  }

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = clientTransactionSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Map form validation values to API input payload
    const payload = {
      amount: Number(result.data.amount),
      merchant: result.data.merchant,
      type: result.data.kind.toUpperCase() as "INCOME" | "EXPENSE" | "TRANSFER",
      categoryId: result.data.category,
      accountId: result.data.account,
      toAccountId: result.data.kind === "transfer" ? result.data.toAccount || null : null,
      date: result.data.date,
      notes: result.data.notes || "",
    };

    try {
      if (mode === "edit" && (transactionId || initialValues?.id)) {
        const id = transactionId || initialValues?.id;
        if (!id) throw new Error("Transaction ID is missing for edit mode.");
        await updateTransaction.mutateAsync({ id, input: payload });
      } else {
        await createTransaction.mutateAsync(payload);
      }
      setOpen?.(false);
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while saving the transaction.",
      });
    }
  };

  const title = mode === "add" ? "Add Transaction" : "Edit Transaction";
  const description =
    mode === "add" ? "Log a new expense, income or transfer." : "Update transaction details.";
  const submitLabel = mode === "add" ? "Save Transaction" : "Update Transaction";

  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  return (
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
      />
    </FormDialog>
  );
}

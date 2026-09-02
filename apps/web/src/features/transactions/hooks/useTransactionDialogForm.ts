"use client";

import { useState } from "react";
import { clientTransactionSchema } from "@finai/validation";
import { useCreateTransaction, useUpdateTransaction } from "../api";

export interface TransactionInitialValues {
  id?: string;
  amount?: number | string;
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
}

export interface UseTransactionDialogFormOptions {
  open: boolean;
  setOpen?: (open: boolean) => void;
  mode?: "add" | "edit";
  transactionId?: string;
  initialValues?: TransactionInitialValues;
}

export function useTransactionDialogForm({
  open,
  setOpen,
  mode = "add",
  transactionId,
  initialValues,
}: UseTransactionDialogFormOptions) {
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const getFormInitialValues = () => {
    return {
      amount: initialValues?.amount !== undefined ? String(initialValues.amount) : "",
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

    const payload = {
      amount: Number(result.data.amount),
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

  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSaving,
    setErrors,
  };
}

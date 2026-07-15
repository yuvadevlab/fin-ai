"use client";

import { useState } from "react";
import { FormDialog } from "@finai/ui";
import { clientTransactionSchema } from "@finai/validation";
import { TransactionForm } from "./TransactionForm";

export interface TransactionDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "add" | "edit";
  initialValues?: Record<string, string>;
  onSubmit?: (values: {
    amount: number;
    merchant: string;
    kind: "expense" | "income" | "transfer";
    category: string;
    account: string;
    date: string;
    notes?: string;
  }) => void;
}

export function TransactionDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  mode = "add",
  initialValues,
  onSubmit,
}: TransactionDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : localOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setLocalOpen;

  const [values, setValues] = useState<Record<string, string>>(() => ({
    amount: initialValues?.amount ?? "",
    merchant: initialValues?.merchant ?? "",
    kind: initialValues?.kind ?? "expense",
    category: initialValues?.category ?? "",
    account: initialValues?.account ?? "",
    date: initialValues?.date ?? new Date().toISOString().split("T")[0],
    notes: initialValues?.notes ?? "",
  }));

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
      setValues({
        amount: initialValues?.amount ?? "",
        merchant: initialValues?.merchant ?? "",
        kind: initialValues?.kind ?? "expense",
        category: initialValues?.category ?? "",
        account: initialValues?.account ?? "",
        date: initialValues?.date ?? new Date().toISOString().split("T")[0],
        notes: initialValues?.notes ?? "",
      });
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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

    if (onSubmit) {
      onSubmit(result.data);
    } else {
      console.log(`${mode === "add" ? "Added" : "Updated"} transaction:`, result.data);
    }

    setOpen?.(false);
  };

  const title = mode === "add" ? "Add Transaction" : "Edit Transaction";
  const description =
    mode === "add" ? "Log a new expense, income or transfer." : "Update transaction details.";
  const submitLabel = mode === "add" ? "Save Transaction" : "Update Transaction";

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      description={description}
      submitLabel={submitLabel}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      <TransactionForm values={values} errors={errors} onChange={handleChange} />
    </FormDialog>
  );
}

"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { createAccountSchema } from "@finai/validation";
import { useCreateAccount } from "../api/createAccount";
import { AccountForm } from "./AccountForm";
import { Account } from "../api/getAccounts";

export interface AccountDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialName?: string;
  onSuccess?: (createdAccount: Account) => void;
}

export function AccountDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  initialName = "",
  onSuccess,
}: AccountDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const createAccount = useCreateAccount();

  const [values, setValues] = useState<Record<string, string>>({
    name: initialName,
    type: "BANK",
    balance: "0",
    currency: "INR",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValues({
        name: initialName,
        type: "BANK",
        balance: "0",
        currency: "INR",
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

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parseResult = createAccountSchema.safeParse({
      name: values.name,
      type: values.type,
      balance: Number(values.balance || 0),
      currency: values.currency,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const createdAccount = await createAccount.mutateAsync(parseResult.data);
      onSuccess?.(createdAccount);
      setOpen?.(false);
      // Reset form
      setValues({
        name: "",
        type: "BANK",
        balance: "0",
        currency: "INR",
      });
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while linking the account.",
      });
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Link Account"
      description="Link a new bank account, credit card, or wallet."
      submitLabel="Link Account"
      loading={createAccount.isPending}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}
      <div className="space-y-4">
        <AccountForm values={values} errors={errors} onChange={handleChange} />
      </div>
    </FormDialog>
  );
}

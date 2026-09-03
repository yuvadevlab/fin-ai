"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { createAccountSchema, updateAccountSchema } from "@finai/validation";
import { useCreateAccount, useUpdateAccount, useAccounts, Account } from "../api";
import { AccountForm } from "./AccountForm";

export interface AccountDialogProps {
  /** Trigger element that opens the dialog (create mode only). */
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When provided, dialog switches to edit mode. */
  account?: Account;
  initialName?: string;
  onSuccess?: (account: Account) => void;
}

const defaultValues = (account?: Account, initialName = ""): Record<string, string> => ({
  name: account?.name ?? initialName,
  type: account?.type ?? "BANK",
  balance: account !== undefined ? String(account.balance) : "0",
  currency: account?.currency ?? "INR",
  isDefault: account?.isDefault ? "true" : "false",
});

export function AccountDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  account,
  initialName = "",
  onSuccess,
}: AccountDialogProps) {
  const isEditMode = account !== undefined;

  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const { data: allAccounts } = useAccounts();
  const hasOtherAccounts = (allAccounts?.length ?? 0) > (isEditMode ? 1 : 0);

  const [values, setValues] = useState<Record<string, string>>(defaultValues(account, initialName));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens / when account changes
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValues(defaultValues(account, initialName));
      setErrors({});
    }
  }

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
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

    if (isEditMode) {
      // Edit mode — partial update, name + isDefault only
      const parseResult = updateAccountSchema.safeParse({
        name: values.name,
        isDefault: values.isDefault === "true",
      });

      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {};
        parseResult.error.issues.forEach((issue) => {
          fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      try {
        const updated = await updateAccount.mutateAsync({
          id: account.id,
          input: parseResult.data,
        });
        onSuccess?.(updated);
        setOpen?.(false);
      } catch (err) {
        const apiErr = err as { message?: string };
        setErrors({ root: apiErr?.message || "Failed to update account." });
      }
      return;
    }

    // Create mode
    const parseResult = createAccountSchema.safeParse({
      name: values.name,
      type: values.type,
      balance: Number(values.balance || 0),
      currency: values.currency,
      isDefault: values.isDefault === "true",
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const created = await createAccount.mutateAsync(parseResult.data);
      onSuccess?.(created);
      setOpen?.(false);
      setValues(defaultValues());
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({ root: apiErr?.message || "An error occurred while linking the account." });
    }
  };

  const isPending = isEditMode ? updateAccount.isPending : createAccount.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={isEditMode ? "Edit Account" : "Link Account"}
      description={
        isEditMode
          ? "Update the account name. Balance is adjusted via transactions."
          : "Link a new bank account, credit card, or wallet."
      }
      submitLabel={isEditMode ? "Save Changes" : "Link Account"}
      loading={isPending}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}
      <div className="space-y-4">
        <AccountForm
          values={values}
          errors={errors}
          onChange={handleChange}
          editMode={isEditMode}
          hasOtherAccounts={hasOtherAccounts}
        />
      </div>
    </FormDialog>
  );
}

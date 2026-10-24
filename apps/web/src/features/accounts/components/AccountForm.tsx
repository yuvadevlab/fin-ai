"use client";

import { FormDialogField, FormField } from "@finai/ui";
import { Star } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

export interface AccountFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  /**
   * When true (edit mode), only the account name is editable.
   * Type, balance, and currency are shown as read-only info since
   * they cannot be changed after creation (balance changes via transactions).
   */
  editMode?: boolean;
  /** Whether there are other accounts (controls default toggle visibility) */
  hasOtherAccounts?: boolean;
}

export function AccountForm({
  values,
  errors,
  onChange,
  editMode = false,
  hasOtherAccounts = false,
}: AccountFormProps) {
  const createFields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: UI_COPY.ACCOUNTS.FORM.NAME,
      placeholder: UI_COPY.ACCOUNTS.FORM.NAME_PLACEHOLDER,
      autoComplete: "off",
    },
    {
      type: "select",
      name: "type",
      label: UI_COPY.ACCOUNTS.FORM.TYPE,
      options: [
        { label: UI_COPY.ACCOUNTS.TYPES.BANK, value: "BANK" },
        { label: UI_COPY.ACCOUNTS.TYPES.CREDIT_CARD, value: "CREDIT_CARD" },
        { label: UI_COPY.ACCOUNTS.TYPES.DIGITAL_WALLET, value: "WALLET" },
        { label: UI_COPY.ACCOUNTS.TYPES.CASH_WALLET, value: "CASH" },
      ],
    },
    {
      type: "number",
      name: "balance",
      label: UI_COPY.ACCOUNTS.FORM.INITIAL_BALANCE,
      placeholder: UI_COPY.ACCOUNTS.FORM.BALANCE_PLACEHOLDER,
      autoComplete: "off",
    },
    {
      type: "text",
      name: "currency",
      label: UI_COPY.ACCOUNTS.FORM.CURRENCY,
      placeholder: UI_COPY.ACCOUNTS.FORM.CURRENCY_PLACEHOLDER,
      autoComplete: "off",
    },
  ];

  // In edit mode only the name field is rendered — other fields are read-only context
  const fields = editMode ? createFields.slice(0, 1) : createFields;

  const isDefault = values.isDefault === "true";

  return (
    <>
      {fields.map((field) => (
        <FormDialogField
          key={field.name}
          field={field}
          value={values[field.name] ?? ""}
          error={errors[field.name]}
          onChange={onChange}
        />
      ))}
      {editMode && (
        <p className="text-muted-foreground text-xs">{UI_COPY.ACCOUNTS.FORM.EDIT_RESTRICTIONS}</p>
      )}

      {/* Default account toggle — only shown when there are multiple accounts or in create mode */}
      {(hasOtherAccounts || !editMode) && (
        <button
          type="button"
          role="checkbox"
          aria-checked={isDefault}
          onClick={() => onChange("isDefault", isDefault ? "false" : "true")}
          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
            isDefault
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-border/60 bg-background hover:border-border text-muted-foreground"
          }`}
        >
          <Star
            className={`size-4 shrink-0 transition-all ${isDefault ? "fill-primary text-primary" : ""}`}
          />
          <div>
            <p className="text-sm leading-none font-medium">
              {isDefault
                ? UI_COPY.ACCOUNTS.FORM.DEFAULT_ACCOUNT
                : UI_COPY.ACCOUNTS.FORM.SET_DEFAULT}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {UI_COPY.ACCOUNTS.FORM.AUTO_SELECTED}
            </p>
          </div>
        </button>
      )}
    </>
  );
}

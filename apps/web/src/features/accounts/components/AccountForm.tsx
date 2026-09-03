"use client";

import { FormDialogField, FormField } from "@finai/ui";
import { Star } from "lucide-react";

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
      label: "Account Name",
      placeholder: "e.g. HDFC Salary, SBI Savings",
      autoComplete: "off",
    },
    {
      type: "select",
      name: "type",
      label: "Account Type",
      options: [
        { label: "Bank Account", value: "BANK" },
        { label: "Credit Card", value: "CREDIT_CARD" },
        { label: "Digital Wallet", value: "WALLET" },
        { label: "Cash Wallet", value: "CASH" },
      ],
    },
    {
      type: "number",
      name: "balance",
      label: "Initial Balance",
      placeholder: "0.00",
      autoComplete: "off",
    },
    {
      type: "text",
      name: "currency",
      label: "Currency",
      placeholder: "INR",
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
        <p className="text-muted-foreground text-xs">
          Account type, currency, and balance cannot be changed directly. Use transactions to adjust
          the balance.
        </p>
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
              {isDefault ? "Default account" : "Set as default account"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Auto-selected when logging new transactions
            </p>
          </div>
        </button>
      )}
    </>
  );
}

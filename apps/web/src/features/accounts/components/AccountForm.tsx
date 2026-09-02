"use client";

import { FormDialogField, FormField } from "@finai/ui";

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
}

export function AccountForm({ values, errors, onChange, editMode = false }: AccountFormProps) {
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
    </>
  );
}

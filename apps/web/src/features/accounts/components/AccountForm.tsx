"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface AccountFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function AccountForm({ values, errors, onChange }: AccountFormProps) {
  const fields: FormField[] = [
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
    </>
  );
}

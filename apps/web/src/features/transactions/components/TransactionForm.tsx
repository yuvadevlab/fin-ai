"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface TransactionFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  accounts: { label: string; value: string }[];
  categories: { label: string; value: string }[];
}

export function TransactionForm({
  values,
  errors,
  onChange,
  accounts,
  categories,
}: TransactionFormProps) {
  const fields: FormField[] = [
    {
      type: "number",
      name: "amount",
      label: "Amount",
      placeholder: "0.00",
    },
    {
      type: "text",
      name: "merchant",
      label: "Merchant",
      placeholder: "e.g. Amazon, Starbucks",
    },
    {
      type: "select",
      name: "kind",
      label: "Type",
      options: [
        { label: "Expense", value: "expense" },
        { label: "Income", value: "income" },
        { label: "Transfer", value: "transfer" },
      ],
    },
    {
      type: "select",
      name: "category",
      label: "Category",
      options: categories,
    },
    {
      type: "select",
      name: "account",
      label: "Account",
      options: accounts,
    },
    // Dynamically show "To Account" if kind is transfer
    ...(values.kind === "transfer"
      ? [
          {
            type: "select" as const,
            name: "toAccount",
            label: "To Account",
            options: accounts,
          },
        ]
      : []),
    {
      type: "date",
      name: "date",
      label: "Date",
    },
    {
      type: "textarea",
      name: "notes",
      label: "Notes",
      placeholder: "Optional notes...",
      rows: 3,
    },
  ];

  return (
    <>
      {fields.map((field) => (
        <FormDialogField
          key={field.name}
          field={field}
          value={values[field.name] || ""}
          error={errors[field.name]}
          onChange={onChange}
        />
      ))}
    </>
  );
}

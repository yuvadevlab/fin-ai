"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface BudgetFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  categories: { label: string; value: string }[];
}

export function BudgetForm({ values, errors, onChange, categories }: BudgetFormProps) {
  const fields: FormField[] = [
    {
      type: "select",
      name: "categoryId",
      label: "Category",
      options: categories,
    },
    {
      type: "number",
      name: "limit",
      label: "Budget Limit",
      placeholder: "0.00",
      autoComplete: "off",
    },
    {
      type: "select",
      name: "period",
      label: "Period",
      options: [
        { label: "Weekly", value: "WEEKLY" },
        { label: "Monthly", value: "MONTHLY" },
        { label: "Yearly", value: "YEARLY" },
      ],
    },
    {
      type: "date",
      name: "startDate",
      label: "Start Date",
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
          onChange={(val) => onChange(field.name, val)}
        />
      ))}
    </>
  );
}

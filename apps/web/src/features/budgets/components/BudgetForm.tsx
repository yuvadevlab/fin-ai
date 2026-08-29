"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface BudgetFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  categories: { label: string; value: string }[];
  onAddCategory?: (initialName?: string) => void;
}

export function BudgetForm({
  values,
  errors,
  onChange,
  categories,
  onAddCategory,
}: BudgetFormProps) {
  const fields: FormField[] = [
    {
      type: "select",
      name: "categoryId",
      label: "Category",
      options: categories,
      searchable: true,
      searchPlaceholder: "Search category...",
      onAddNew: onAddCategory,
      addNewLabel: "+ Add Category",
    },
    {
      type: "number",
      name: "limit",
      label: "Monthly Budget Limit (₹)",
      placeholder: "e.g. 15000",
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

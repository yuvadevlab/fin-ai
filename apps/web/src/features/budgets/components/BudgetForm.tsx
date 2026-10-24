"use client";

import { FormDialogField, FormField } from "@finai/ui";
import { UI_COPY } from "@/lib/ui-copy";

export interface BudgetFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  categories: { label: string; value: string }[];
  onAddCategory?: (initialName?: string) => void;
  isEditMode?: boolean;
}

export function BudgetForm({
  values,
  errors,
  onChange,
  categories,
  onAddCategory,
  isEditMode = false,
}: BudgetFormProps) {
  const fields: FormField[] = [
    {
      type: "select",
      name: "categoryId",
      label: UI_COPY.BUDGETS.FORM.CATEGORY,
      options: categories,
      searchable: true,
      disabled: isEditMode,
      searchPlaceholder: UI_COPY.BUDGETS.FORM.SEARCH_CATEGORY,
      onAddNew: isEditMode ? undefined : onAddCategory,
      addNewLabel: UI_COPY.BUDGETS.FORM.ADD_CATEGORY,
    },
    {
      type: "number",
      name: "limit",
      label: UI_COPY.BUDGETS.FORM.LIMIT,
      placeholder: UI_COPY.BUDGETS.FORM.LIMIT_PLACEHOLDER,
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

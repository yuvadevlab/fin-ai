"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface GoalFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function GoalForm({ values, errors, onChange }: GoalFormProps) {
  const fields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: "Goal Name",
      placeholder: "e.g. Dream House, New Car, Vacation",
      autoComplete: "off",
    },
    {
      type: "number",
      name: "targetAmount",
      label: "Target Amount",
      placeholder: "0.00",
      autoComplete: "off",
    },
    {
      type: "number",
      name: "currentAmount",
      label: "Initial Savings",
      placeholder: "0.00",
      autoComplete: "off",
    },
    {
      type: "date",
      name: "deadline",
      label: "Target Deadline",
      autoComplete: "off",
    },
    {
      type: "select",
      name: "type",
      label: "Scope",
      options: [
        { label: "Personal Goal", value: "PERSONAL" },
        { label: "Family / Shared Goal", value: "FAMILY" },
      ],
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

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
      placeholder: "e.g. Emergency Fund, Dream Vacation, New Home",
      autoComplete: "off",
    },
    {
      type: "select",
      name: "type",
      label: "Goal Type",
      placeholder: "Select a goal type",
      options: [
        { label: "Emergency Fund", value: "EMERGENCY_FUND" },
        { label: "Obligation", value: "OBLIGATION" },
        { label: "Lifestyle", value: "LIFESTYLE" },
        { label: "Personal", value: "PERSONAL" },
      ],
    },
    {
      type: "number",
      name: "targetAmount",
      label: "Target Amount (₹)",
      placeholder: "0.00",
      autoComplete: "off",
    },
    {
      type: "number",
      name: "currentAmount",
      label: "Current Amount Saved (₹)",
      placeholder: "0.00",
      autoComplete: "off",
    },
    {
      type: "date",
      name: "deadline",
      label: "Target Deadline",
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

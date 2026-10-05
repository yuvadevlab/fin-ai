"use client";

import { FormDialogField, FormField } from "@finai/ui";
import { GoalType } from "@finai/shared-types";
import { useReferenceOptions } from "@/hooks/useReferenceOptions";

export interface GoalFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

/** Fallback goal type options shown while DB options are loading. */
const FALLBACK_GOAL_TYPE_OPTIONS = [
  { label: "Emergency Fund", value: GoalType.EMERGENCY_FUND },
  { label: "Obligation", value: GoalType.OBLIGATION },
  { label: "Lifestyle", value: GoalType.LIFESTYLE },
  { label: "Personal", value: GoalType.PERSONAL },
];

export function GoalForm({ values, errors, onChange }: GoalFormProps) {
  const { data: goalTypeOptions } = useReferenceOptions("GOAL_TYPE");

  const typeOptions = (goalTypeOptions ?? FALLBACK_GOAL_TYPE_OPTIONS).map((opt) => ({
    label: opt.label,
    value: opt.value,
  }));

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
      options: typeOptions,
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
      label: "Target Date",
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

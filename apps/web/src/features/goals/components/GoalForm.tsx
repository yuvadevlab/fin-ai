"use client";

import { FormDialogField, FormField } from "@finai/ui";
import { GoalType } from "@finai/shared-types";
import { useReferenceOptions } from "@/hooks/useReferenceOptions";
import { UI_COPY } from "@/lib/ui-copy";

export interface GoalFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

/** Fallback goal type options shown while DB options are loading. */
const FALLBACK_GOAL_TYPE_OPTIONS = [
  { label: UI_COPY.GOALS.FORM.TYPES.EMERGENCY_FUND, value: GoalType.EMERGENCY_FUND },
  { label: UI_COPY.GOALS.FORM.TYPES.OBLIGATION, value: GoalType.OBLIGATION },
  { label: UI_COPY.GOALS.FORM.TYPES.LIFESTYLE, value: GoalType.LIFESTYLE },
  { label: UI_COPY.GOALS.FORM.TYPES.PERSONAL, value: GoalType.PERSONAL },
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
      label: UI_COPY.GOALS.FORM.NAME,
      placeholder: UI_COPY.GOALS.FORM.NAME_PLACEHOLDER,
      autoComplete: "off",
    },
    {
      type: "select",
      name: "type",
      label: UI_COPY.GOALS.FORM.TYPE,
      placeholder: UI_COPY.GOALS.FORM.TYPE_PLACEHOLDER,
      options: typeOptions,
    },
    {
      type: "number",
      name: "targetAmount",
      label: UI_COPY.GOALS.FORM.TARGET_AMOUNT,
      placeholder: UI_COPY.GOALS.FORM.AMOUNT_PLACEHOLDER,
      autoComplete: "off",
    },
    {
      type: "number",
      name: "currentAmount",
      label: UI_COPY.GOALS.FORM.CURRENT_AMOUNT,
      placeholder: UI_COPY.GOALS.FORM.AMOUNT_PLACEHOLDER,
      autoComplete: "off",
    },
    {
      type: "date",
      name: "deadline",
      label: UI_COPY.GOALS.FORM.TARGET_DATE,
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

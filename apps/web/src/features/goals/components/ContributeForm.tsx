"use client";

import { FormDialogField, FormField } from "@finai/ui";
import { UI_COPY } from "@/lib/ui-copy";

export interface ContributeFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function ContributeForm({ values, errors, onChange }: ContributeFormProps) {
  const fields: FormField[] = [
    {
      type: "number",
      name: "amount",
      label: UI_COPY.GOALS.FORM.CONTRIBUTION_AMOUNT,
      placeholder: UI_COPY.GOALS.FORM.CONTRIBUTION_PLACEHOLDER,
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

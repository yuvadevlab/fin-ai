"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface WorkspaceFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function WorkspaceForm({ values, errors, onChange }: WorkspaceFormProps) {
  const fields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: "Workspace Name",
      placeholder: "e.g. My Shared Finances, Joint Account",
      autoComplete: "off",
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

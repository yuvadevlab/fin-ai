"use client";

import React from "react";
import { FormDialogField, FormField } from "@finai/ui";
import { UI_COPY } from "@/lib";

export interface CreateWorkspaceFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function CreateWorkspaceForm({ values, errors, onChange }: CreateWorkspaceFormProps) {
  const fields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: UI_COPY.WORKSPACES.WORKSPACE_NAME,
      placeholder: UI_COPY.WORKSPACES.WORKSPACE_NAME_PLACEHOLDER,
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
      <p className="text-muted-foreground text-xs">{UI_COPY.WORKSPACES.CREATE_DESCRIPTION}</p>
    </>
  );
}

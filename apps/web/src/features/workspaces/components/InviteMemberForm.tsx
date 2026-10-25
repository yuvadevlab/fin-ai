"use client";

import React from "react";
import { FormDialogField, FormField } from "@finai/ui";
import { WorkspaceRole } from "@finai/shared-types";
import { UI_COPY } from "@/lib";

export interface InviteMemberFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function InviteMemberForm({ values, errors, onChange }: InviteMemberFormProps) {
  const fields: FormField[] = [
    {
      type: "text",
      name: "email",
      label: UI_COPY.WORKSPACES.EMAIL_LABEL,
      placeholder: UI_COPY.WORKSPACES.EMAIL_PLACEHOLDER,
      autoComplete: "email",
    },
    {
      type: "select",
      name: "role",
      label: UI_COPY.WORKSPACES.ROLE_LABEL,
      options: [
        { label: UI_COPY.WORKSPACES.ROLE_MEMBER, value: WorkspaceRole.MEMBER },
        { label: UI_COPY.WORKSPACES.ROLE_ADMIN, value: WorkspaceRole.ADMIN },
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
          onChange={onChange}
        />
      ))}
      <p className="text-muted-foreground text-xs">{UI_COPY.WORKSPACES.INVITE_DESCRIPTION}</p>
    </>
  );
}

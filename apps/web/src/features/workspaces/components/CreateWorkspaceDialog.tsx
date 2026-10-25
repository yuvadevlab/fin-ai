"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { WorkspaceType } from "@finai/shared-types";
import { createWorkspaceSchema } from "@finai/validation";
import { UI_COPY } from "@/lib";
import { useCreateWorkspace } from "../api";
import { useWorkspace } from "@/providers";
import { CreateWorkspaceForm } from "./CreateWorkspaceForm";

export interface CreateWorkspaceDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateWorkspaceDialog({ open, onOpenChange, trigger }: CreateWorkspaceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    type: WorkspaceType.FAMILY,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateWorkspace();
  const { switchWorkspace } = useWorkspace();

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    const parseResult = createWorkspaceSchema.safeParse({
      name: values.name,
      type: WorkspaceType.FAMILY,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const newWs = await createMutation.mutateAsync(parseResult.data);
      switchWorkspace(newWs.id);
      setOpen(false);
      setValues({ name: "", type: WorkspaceType.FAMILY });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create workspace";
      setErrors({ root: errorMsg });
    }
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={setOpen}
      title={UI_COPY.WORKSPACES.CREATE_TITLE}
      description={UI_COPY.WORKSPACES.CREATE_DESCRIPTION}
      submitLabel={UI_COPY.WORKSPACES.CREATE_FAMILY}
      loading={createMutation.isPending}
      onSubmit={handleSubmit}
      trigger={trigger}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive rounded-lg p-3 text-sm">
          {errors.root}
        </div>
      )}
      <CreateWorkspaceForm values={values} errors={errors} onChange={handleChange} />
    </FormDialog>
  );
}

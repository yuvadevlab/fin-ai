"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { createWorkspaceSchema } from "@finai/validation";
import { WorkspaceForm } from "./WorkspaceForm";
import { useCreateWorkspace } from "../api";

export interface WorkspaceDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WorkspaceDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: WorkspaceDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : localOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setLocalOpen;

  const createWorkspace = useCreateWorkspace();

  const getFormInitialValues = () => ({
    name: "",
  });

  const [values, setValues] = useState<Record<string, string>>(getFormInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValues(getFormInitialValues());
      setErrors({});
    }
  }

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = createWorkspaceSchema.safeParse({
      ...values,
      type: "FAMILY",
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await createWorkspace.mutateAsync({
        name: result.data.name,
        type: result.data.type as "PERSONAL" | "FAMILY",
      });
      setOpen?.(false);
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while creating the workspace.",
      });
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Create Workspace"
      description="Workspaces isolate your finance calculations. Invite members to collaborate on Family plans."
      submitLabel="Create Workspace"
      loading={createWorkspace.isPending}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}
      <WorkspaceForm values={values} errors={errors} onChange={handleChange} />
    </FormDialog>
  );
}

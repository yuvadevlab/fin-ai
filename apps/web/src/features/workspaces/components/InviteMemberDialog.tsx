"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { inviteWorkspaceMemberSchema } from "@finai/validation";
import { UI_COPY } from "@/lib";
import { useInviteMember } from "../api";
import { InviteMemberForm } from "./InviteMemberForm";

export interface InviteMemberDialogProps {
  workspaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function InviteMemberDialog({
  workspaceId,
  open,
  onOpenChange,
  trigger,
}: InviteMemberDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  const [values, setValues] = useState<Record<string, string>>({
    email: "",
    role: "MEMBER",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inviteMutation = useInviteMember();

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
    const parseResult = inviteWorkspaceMemberSchema.safeParse({
      email: values.email,
      role: values.role,
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
      await inviteMutation.mutateAsync({
        workspaceId,
        input: parseResult.data,
      });
      setOpen(false);
      setValues({ email: "", role: "MEMBER" });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to invite member";
      setErrors({ root: errorMsg });
    }
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={setOpen}
      title={UI_COPY.WORKSPACES.INVITE_TITLE}
      description={UI_COPY.WORKSPACES.INVITE_DESCRIPTION}
      submitLabel={UI_COPY.WORKSPACES.INVITE_MEMBER}
      loading={inviteMutation.isPending}
      onSubmit={handleSubmit}
      trigger={trigger}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive rounded-lg p-3 text-sm">
          {errors.root}
        </div>
      )}
      <InviteMemberForm values={values} errors={errors} onChange={handleChange} />
    </FormDialog>
  );
}

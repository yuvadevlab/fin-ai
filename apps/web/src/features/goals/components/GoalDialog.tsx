"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { createGoalSchema } from "@finai/validation";
import { useCreateGoal } from "../api/createGoal";
import { useWorkspace } from "@/providers";
import { GoalForm } from "./GoalForm";

export interface GoalDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GoalDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: GoalDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const { workspaceId } = useWorkspace();
  const createGoal = useCreateGoal(workspaceId);

  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    deadline: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate())
      .toISOString()
      .split("T")[0],
    type: "PERSONAL",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parseResult = createGoalSchema.safeParse({
      name: values.name,
      targetAmount: Number(values.targetAmount || 0),
      currentAmount: Number(values.currentAmount || 0),
      deadline: values.deadline,
      type: values.type,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await createGoal.mutateAsync(parseResult.data);
      setOpen?.(false);
      // Reset form
      setValues({
        name: "",
        targetAmount: "",
        currentAmount: "0",
        deadline: new Date(
          new Date().getFullYear() + 1,
          new Date().getMonth(),
          new Date().getDate(),
        )
          .toISOString()
          .split("T")[0],
        type: "PERSONAL",
      });
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while creating the goal.",
      });
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Create Goal"
      description="Define a savings target and tracking deadline."
      submitLabel="Create Goal"
      loading={createGoal.isPending}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}
      <div className="space-y-4">
        <GoalForm values={values} errors={errors} onChange={handleChange} />
      </div>
    </FormDialog>
  );
}

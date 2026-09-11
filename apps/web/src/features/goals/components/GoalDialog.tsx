"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { createGoalSchema } from "@finai/validation";
import { useCreateGoal, type Goal } from "../api";
import { GoalForm } from "./GoalForm";

export interface GoalDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialName?: string;
  onSuccess?: (created: Goal) => void;
}

const getDefaultDeadline = () =>
  new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate())
    .toISOString()
    .split("T")[0];

export function GoalDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  initialName = "",
  onSuccess,
}: GoalDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const createGoal = useCreateGoal();

  const getInitialValues = () => ({
    name: initialName,
    type: "PERSONAL",
    targetAmount: "",
    currentAmount: "0",
    deadline: getDefaultDeadline(),
  });

  const [values, setValues] = useState<Record<string, string>>(getInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync initialName when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValues(getInitialValues());
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

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parseResult = createGoalSchema.safeParse({
      name: values.name,
      type: values.type || "PERSONAL",
      targetAmount: Number(values.targetAmount || 0),
      currentAmount: Number(values.currentAmount || 0),
      deadline: values.deadline || null,
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
      const created = await createGoal.mutateAsync(parseResult.data);
      onSuccess?.(created);
      setOpen?.(false);
      // Reset form
      setValues({
        name: "",
        type: "PERSONAL",
        targetAmount: "",
        currentAmount: "0",
        deadline: getDefaultDeadline(),
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

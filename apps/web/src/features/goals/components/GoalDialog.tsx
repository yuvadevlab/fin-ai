"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { GoalType } from "@finai/shared-types";
import { createGoalSchema, updateGoalSchema } from "@finai/validation";
import { useCreateGoal, useUpdateGoal, type Goal } from "../api";
import { GoalForm } from "./GoalForm";

export interface GoalDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialName?: string;
  goal?: Goal;
  onSuccess?: (goal: Goal) => void;
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
  goal,
  onSuccess,
}: GoalDialogProps) {
  const isEditMode = goal !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  const getInitialValues = () => ({
    name: goal?.name ?? initialName,
    type: goal?.type ?? GoalType.PERSONAL,
    targetAmount: goal ? String(goal.targetAmount) : "",
    currentAmount: goal ? String(goal.currentAmount) : "0",
    deadline: goal?.deadline ? goal.deadline.split("T")[0] : getDefaultDeadline(),
  });

  const [values, setValues] = useState<Record<string, string>>(getInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync values when dialog opens or target goal changes
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevGoalId, setPrevGoalId] = useState(goal?.id);

  if (open !== prevOpen || goal?.id !== prevGoalId) {
    setPrevOpen(open);
    setPrevGoalId(goal?.id);
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

  const resetForm = () => {
    setValues({
      name: "",
      type: GoalType.PERSONAL,
      targetAmount: "",
      currentAmount: "0",
      deadline: getDefaultDeadline(),
    });
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const rawPayload = {
      name: values.name,
      type: (values.type || GoalType.PERSONAL) as GoalType,
      targetAmount: Number(values.targetAmount || 0),
      currentAmount: Number(values.currentAmount || 0),
      deadline: values.deadline || null,
    };

    if (isEditMode && goal) {
      const parseResult = updateGoalSchema.safeParse(rawPayload);
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
        const updated = await updateGoal.mutateAsync({
          id: goal.id,
          input: parseResult.data,
        });
        onSuccess?.(updated);
        setOpen?.(false);
        resetForm();
      } catch (err) {
        const apiErr = err as { message?: string };
        setErrors({
          root: apiErr?.message || "An error occurred while updating the goal.",
        });
      }
      return;
    }

    const parseResult = createGoalSchema.safeParse(rawPayload);
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
      resetForm();
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
      title={isEditMode ? "Edit Goal" : "Create Goal"}
      description={
        isEditMode
          ? "Update your savings target, current progress, or deadline."
          : "Define a savings target and tracking deadline."
      }
      submitLabel={isEditMode ? "Save Changes" : "Create Goal"}
      loading={isEditMode ? updateGoal.isPending : createGoal.isPending}
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

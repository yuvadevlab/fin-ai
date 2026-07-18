"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { useContributeGoal } from "../api/createGoal";
import { useWorkspace } from "@/providers";
import { ContributeForm } from "./ContributeForm";
import { contributeSchema } from "@finai/validation";

export interface ContributeDialogProps {
  goalId: string;
  goalName: string;
  trigger?: React.ReactNode;
}

export function ContributeDialog({ goalId, goalName, trigger }: ContributeDialogProps) {
  const [open, setOpen] = useState(false);
  const { workspaceId } = useWorkspace();
  const contributeGoal = useContributeGoal(workspaceId);

  const [values, setValues] = useState<Record<string, string>>({
    amount: "",
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

    const parseResult = contributeSchema.safeParse(values);

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
      await contributeGoal.mutateAsync({ id: goalId, amount: parseResult.data.amount });
      setOpen(false);
      setValues({ amount: "" });
      setErrors({});
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({ amount: apiErr?.message || "An error occurred while contributing." });
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={`Contribute to ${goalName}`}
      description="Add funds from your workspace accounts toward this goal."
      submitLabel="Record Contribution"
      loading={contributeGoal.isPending}
      onCancel={() => setOpen(false)}
      onSubmit={handleSubmit}
    >
      {errors.amount && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.amount}
        </div>
      )}
      <div className="space-y-4">
        <ContributeForm values={values} errors={errors} onChange={handleChange} />
      </div>
    </FormDialog>
  );
}

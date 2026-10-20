"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { contributeSchema } from "@finai/validation";
import { useContributeGoal } from "../api";
import { ContributeForm } from "./ContributeForm";
import { UI_COPY } from "@/lib/ui-copy";

export interface ContributeDialogProps {
  goalId: string;
  goalName: string;
  trigger?: React.ReactNode;
}

export function ContributeDialog({ goalId, goalName, trigger }: ContributeDialogProps) {
  const [open, setOpen] = useState(false);
  const contributeGoal = useContributeGoal();

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
      setErrors({ amount: apiErr?.message || UI_COPY.GOALS.CONTRIBUTION_ERROR });
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={UI_COPY.GOALS.CONTRIBUTE_TITLE(goalName)}
      description={UI_COPY.GOALS.CONTRIBUTION_DESCRIPTION}
      submitLabel={UI_COPY.GOALS.RECORD_CONTRIBUTION}
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

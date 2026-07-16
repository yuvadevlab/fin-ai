"use client";

import React, { useState } from "react";
import { FormDialog, FormDialogField, FormField } from "@finai/ui";
import { useContributeGoal } from "../api/createGoal";
import { useWorkspace } from "@/providers";

export interface ContributeDialogProps {
  goalId: string;
  goalName: string;
  trigger?: React.ReactNode;
}

export function ContributeDialog({ goalId, goalName, trigger }: ContributeDialogProps) {
  const [open, setOpen] = useState(false);
  const { workspaceId } = useWorkspace();
  const contributeGoal = useContributeGoal(workspaceId);

  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const val = Number(amount || 0);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid positive contribution amount.");
      return;
    }

    try {
      await contributeGoal.mutateAsync({ id: goalId, amount: val });
      setOpen(false);
      setAmount("");
    } catch (err) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || "An error occurred while contributing.");
    }
  };

  const field: FormField = {
    type: "number",
    name: "amount",
    label: "Amount",
    placeholder: "e.g. ₹5,000",
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
      {error && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <FormDialogField
          field={field}
          value={amount}
          error={error ?? undefined}
          onChange={(val) => {
            setAmount(val);
            setError(null);
          }}
        />
      </div>
    </FormDialog>
  );
}

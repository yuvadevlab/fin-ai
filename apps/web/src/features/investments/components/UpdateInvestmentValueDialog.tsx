"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { updateInvestmentValueSchema } from "@finai/validation";
import { useUpdateInvestmentValue } from "../api";
import { UpdateInvestmentValueForm } from "./UpdateInvestmentValueForm";

export interface UpdateInvestmentValueDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  investment: {
    id: string;
    name: string;
    currentValue: number;
    investedAmount?: number;
  };
}

export function UpdateInvestmentValueDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  investment,
}: UpdateInvestmentValueDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const updateValueMutation = useUpdateInvestmentValue();

  const [values, setValues] = useState<Record<string, string>>({
    currentValue: String(investment.currentValue ?? ""),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevVal, setPrevVal] = useState(investment.currentValue);

  if (open !== prevOpen || investment.currentValue !== prevVal) {
    setPrevOpen(open);
    setPrevVal(investment.currentValue);
    if (open) {
      setValues({ currentValue: String(investment.currentValue ?? "") });
      setErrors({});
    }
  }

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

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parseResult = updateInvestmentValueSchema.safeParse({
      currentValue: Number(values.currentValue || 0),
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
      await updateValueMutation.mutateAsync({
        id: investment.id,
        currentValue: parseResult.data.currentValue,
      });
      setOpen?.(false);
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while updating market value.",
      });
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Update Market Value"
      description="Update current market value to reflect market movements or portfolio changes."
      submitLabel="Save Market Value"
      loading={updateValueMutation.isPending}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}
      <UpdateInvestmentValueForm
        values={values}
        errors={errors}
        onChange={handleChange}
        investmentName={investment.name}
        investedAmount={investment.investedAmount}
      />
    </FormDialog>
  );
}

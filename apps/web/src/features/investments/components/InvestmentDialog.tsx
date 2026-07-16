"use client";

import React, { useState } from "react";
import { FormDialog, FormDialogField, FormField } from "@finai/ui";
import { createInvestmentSchema } from "@finai/validation";
import { useCreateInvestment } from "../api/createInvestment";
import { useWorkspace } from "@/providers";

export interface InvestmentDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InvestmentDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: InvestmentDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const { workspaceId } = useWorkspace();
  const createInvestment = useCreateInvestment(workspaceId);

  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    assetClass: "STOCK",
    investedAmount: "",
    currentValue: "",
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

    const parseResult = createInvestmentSchema.safeParse({
      name: values.name,
      assetClass: values.assetClass,
      investedAmount: Number(values.investedAmount || 0),
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
      await createInvestment.mutateAsync(parseResult.data);
      setOpen?.(false);
      // Reset form
      setValues({
        name: "",
        assetClass: "STOCK",
        investedAmount: "",
        currentValue: "",
      });
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while tracking the investment.",
      });
    }
  };

  const fields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: "Investment Name",
      placeholder: "e.g. Zerodha Nifty 50 Mutual Fund",
    },
    {
      type: "select",
      name: "assetClass",
      label: "Asset Class",
      options: [
        { label: "Mutual Fund", value: "MUTUAL_FUND" },
        { label: "Stock Equities", value: "STOCK" },
        { label: "Fixed Deposit", value: "FIXED_DEPOSIT" },
        { label: "Gold", value: "GOLD" },
        { label: "EPF Retirement Fund", value: "EPF" },
        { label: "PPF Savings Fund", value: "PPF" },
        { label: "Real Estate", value: "REAL_ESTATE" },
        { label: "Crypto Currency", value: "CRYPTO" },
        { label: "Other Asset", value: "OTHER" },
      ],
    },
    {
      type: "number",
      name: "investedAmount",
      label: "Invested Amount",
      placeholder: "0.00",
    },
    {
      type: "number",
      name: "currentValue",
      label: "Current Market Value",
      placeholder: "0.00",
    },
  ];

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Track Investment"
      description="Record stock buys, mutual funds, gold or other investments."
      submitLabel="Track Investment"
      loading={createInvestment.isPending}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}
      <div className="space-y-4">
        {fields.map((field) => (
          <FormDialogField
            key={field.name}
            field={field}
            value={values[field.name] ?? ""}
            error={errors[field.name]}
            onChange={(val) => handleChange(field.name, val)}
          />
        ))}
      </div>
    </FormDialog>
  );
}

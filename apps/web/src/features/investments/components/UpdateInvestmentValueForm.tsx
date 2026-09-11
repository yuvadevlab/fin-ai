"use client";

import React from "react";
import { FormDialogField, FormField } from "@finai/ui";

export interface UpdateInvestmentValueFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  investmentName?: string;
  investedAmount?: number;
}

export function UpdateInvestmentValueForm({
  values,
  errors,
  onChange,
  investmentName,
  investedAmount,
}: UpdateInvestmentValueFormProps) {
  const fields: FormField[] = [
    {
      type: "number",
      name: "currentValue",
      label: "Current Market Value (₹)",
      placeholder: "0.00",
      autoComplete: "off",
    },
  ];

  return (
    <div className="space-y-4">
      {investmentName && (
        <div className="bg-secondary/40 border-border/50 rounded-lg border p-3 text-xs">
          <p className="text-foreground font-semibold">{investmentName}</p>
          {investedAmount !== undefined && (
            <p className="text-muted-foreground mt-0.5">
              Invested Principal: ₹{investedAmount.toLocaleString("en-IN")}
            </p>
          )}
        </div>
      )}
      {fields.map((field) => (
        <FormDialogField
          key={field.name}
          field={field}
          value={values[field.name] ?? ""}
          error={errors[field.name]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

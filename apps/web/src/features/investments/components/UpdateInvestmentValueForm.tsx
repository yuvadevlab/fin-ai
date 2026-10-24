"use client";

import React from "react";
import { FormDialogField, FormField } from "@finai/ui";
import { UI_COPY } from "@/lib/ui-copy";

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
      label: UI_COPY.INVESTMENTS.FORM.CURRENT_VALUE_CURRENCY,
      placeholder: UI_COPY.INVESTMENTS.FORM.PLACEHOLDER_AMOUNT,
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
              {UI_COPY.INVESTMENTS.FORM.INVESTED_PRINCIPAL} ₹
              {investedAmount.toLocaleString("en-IN")}
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

"use client";

import React from "react";
import { FormDialogField, FormField } from "@fin-ai/ui";
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
    <div className="fn-investment-form-stack">
      {investmentName && (
        <div className="fn-investment-summary-box">
          <p className="fn-investment-summary-name">{investmentName}</p>
          {investedAmount !== undefined && (
            <p className="fn-investment-summary-principal">
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

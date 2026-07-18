"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface InvestmentFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function InvestmentForm({ values, errors, onChange }: InvestmentFormProps) {
  const fields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: "Investment Name",
      placeholder: "e.g. Zerodha Nifty 50 Mutual Fund",
      autoComplete: "off",
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
      autoComplete: "off",
    },
    {
      type: "number",
      name: "currentValue",
      label: "Current Market Value",
      placeholder: "0.00",
      autoComplete: "off",
    },
  ];

  return (
    <>
      {fields.map((field) => (
        <FormDialogField
          key={field.name}
          field={field}
          value={values[field.name] ?? ""}
          error={errors[field.name]}
          onChange={(val) => onChange(field.name, val)}
        />
      ))}
    </>
  );
}

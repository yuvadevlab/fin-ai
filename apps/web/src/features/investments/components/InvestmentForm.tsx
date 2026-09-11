"use client";

import { FormDialogField, FormField } from "@finai/ui";
import { useReferenceOptions } from "@/hooks/useReferenceOptions";

export interface InvestmentFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

/** Fallback asset class options shown while DB options are loading. */
const FALLBACK_ASSET_CLASS_OPTIONS = [
  { label: "Mutual Fund", value: "MUTUAL_FUND" },
  { label: "Stock Equities", value: "STOCK" },
  { label: "Fixed Deposit", value: "FIXED_DEPOSIT" },
  { label: "Gold", value: "GOLD" },
  { label: "EPF Retirement Fund", value: "EPF" },
  { label: "PPF Savings Fund", value: "PPF" },
  { label: "Real Estate", value: "REAL_ESTATE" },
  { label: "Crypto Currency", value: "CRYPTO" },
  { label: "Other Asset", value: "OTHER" },
];

export function InvestmentForm({ values, errors, onChange }: InvestmentFormProps) {
  const { data: assetClassOptions } = useReferenceOptions("ASSET_CLASS");

  const assetOptions = (assetClassOptions ?? FALLBACK_ASSET_CLASS_OPTIONS).map((opt) => ({
    label: opt.label,
    value: opt.value,
  }));

  const fields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: "Investment Name",
      placeholder: "e.g. Nifty 50 Mutual Fund",
      autoComplete: "off",
    },
    {
      type: "select",
      name: "assetClass",
      label: "Asset Class",
      options: assetOptions,
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
          onChange={onChange}
        />
      ))}
    </>
  );
}

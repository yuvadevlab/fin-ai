"use client";

import { FormDialogField, FormField } from "@finai/ui";
import { useReferenceOptions } from "@/hooks/useReferenceOptions";
import { UI_COPY } from "@/lib/ui-copy";

export interface InvestmentFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

/** Fallback asset class options shown while DB options are loading. */
const FALLBACK_ASSET_CLASS_OPTIONS = [
  { label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASSES.MUTUAL_FUND, value: "MUTUAL_FUND" },
  { label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASSES.STOCK, value: "STOCK" },
  { label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASSES.FIXED_DEPOSIT, value: "FIXED_DEPOSIT" },
  { label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASSES.GOLD, value: "GOLD" },
  { label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASSES.EPF, value: "EPF" },
  { label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASSES.PPF, value: "PPF" },
  { label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASSES.REAL_ESTATE, value: "REAL_ESTATE" },
  { label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASSES.CRYPTO, value: "CRYPTO" },
  { label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASSES.OTHER, value: "OTHER" },
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
      label: UI_COPY.INVESTMENTS.FORM.NAME,
      placeholder: UI_COPY.INVESTMENTS.FORM.NAME_PLACEHOLDER,
      autoComplete: "off",
    },
    {
      type: "select",
      name: "assetClass",
      label: UI_COPY.INVESTMENTS.FORM.ASSET_CLASS,
      options: assetOptions,
    },
    {
      type: "number",
      name: "investedAmount",
      label: UI_COPY.INVESTMENTS.FORM.INVESTED_AMOUNT,
      placeholder: UI_COPY.INVESTMENTS.FORM.PLACEHOLDER_AMOUNT,
      autoComplete: "off",
    },
    {
      type: "number",
      name: "currentValue",
      label: UI_COPY.INVESTMENTS.FORM.CURRENT_VALUE,
      placeholder: UI_COPY.INVESTMENTS.FORM.PLACEHOLDER_AMOUNT,
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

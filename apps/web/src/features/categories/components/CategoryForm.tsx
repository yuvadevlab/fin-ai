"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface CategoryFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function CategoryForm({ values, errors, onChange }: CategoryFormProps) {
  const fields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: "Category Name",
      placeholder: "e.g. Subscriptions, Pet Care, Taxes",
      autoComplete: "off",
    },
    {
      type: "select",
      name: "group",
      label: "Group",
      options: [
        { label: "Fixed Expenses", value: "Fixed Expenses" },
        { label: "Variable Expenses", value: "Variable Expenses" },
        { label: "Savings & Investments", value: "Savings & Investments" },
        { label: "Income", value: "Income" },
      ],
    },
    {
      type: "select",
      name: "icon",
      label: "Icon",
      options: [
        { label: "🛒 Shopping Cart", value: "shopping-cart" },
        { label: "☕ Coffee & Dining", value: "coffee" },
        { label: "🚗 Car & Transport", value: "car" },
        { label: "⚡ Utilities & Bills", value: "zap" },
        { label: "🏠 Home & Housing", value: "home" },
        { label: "🛍️ Shopping", value: "shopping-bag" },
        { label: "🎬 Film & Entertainment", value: "film" },
        { label: "📈 Income & Investment", value: "trending-up" },
        { label: "❤️ Health & Care", value: "heart" },
        { label: "🎁 Gifts", value: "gift" },
        { label: "💼 Work & Salary", value: "briefcase" },
        { label: "😊 Lifestyle", value: "smile" },
        { label: "📚 Education", value: "book" },
        { label: "🏷️ General Tag", value: "tag" },
        { label: "💼 Work & Salary", value: "briefcase" },
      ],
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

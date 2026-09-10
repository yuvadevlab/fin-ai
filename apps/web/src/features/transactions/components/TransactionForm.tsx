"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface TransactionFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  accounts: { label: string; value: string }[];
  categories: { label: string; value: string }[];
  investments?: { label: string; value: string }[];
  goals?: { label: string; value: string }[];
  onAddCategory?: (initialName?: string) => void;
  onAddAccount?: (initialName?: string) => void;
  onAddInvestment?: (initialName?: string) => void;
  onAddGoal?: (initialName?: string) => void;
}

export function TransactionForm({
  values,
  errors,
  onChange,
  accounts,
  categories,
  investments = [],
  goals = [],
  onAddCategory,
  onAddAccount,
  onAddInvestment,
  onAddGoal,
}: TransactionFormProps) {
  const amountField: FormField = {
    type: "number",
    name: "amount",
    label: "Amount",
    placeholder: "0.00",
    autoComplete: "off",
  };

  const kindField: FormField = {
    type: "select",
    name: "kind",
    label: "Type",
    options: [
      { label: "Expense", value: "expense" },
      { label: "Income", value: "income" },
      { label: "Transfer", value: "transfer" },
      { label: "Investment", value: "investment" },
      { label: "Goal", value: "goal" },
    ],
  };

  const investmentField: FormField = {
    type: "select",
    name: "investmentId",
    label: "Investment",
    options: investments,
    searchable: true,
    searchPlaceholder: "Search investment...",
    onAddNew: onAddInvestment,
    addNewLabel: "+ Add Investment",
  };

  const goalField: FormField = {
    type: "select",
    name: "goalId",
    label: "Savings Goal",
    options: goals,
    searchable: true,
    searchPlaceholder: "Search savings goal...",
    onAddNew: onAddGoal,
    addNewLabel: "+ Add Goal",
  };

  const categoryField: FormField = {
    type: "select",
    name: "category",
    label: "Category",
    options: categories,
    searchable: true,
    searchPlaceholder: "Search category...",
    onAddNew: onAddCategory,
    addNewLabel: "+ Add Category",
  };

  const accountField: FormField = {
    type: "select",
    name: "account",
    label:
      values.kind === "transfer"
        ? "From Account"
        : values.kind === "investment" || values.kind === "goal"
          ? "Pay From Account"
          : "Account",
    options: accounts,
    searchable: true,
    searchPlaceholder: "Search account...",
    onAddNew: onAddAccount,
    addNewLabel: "+ Link Account",
  };

  const toAccountField: FormField = {
    type: "select",
    name: "toAccount",
    label: "To Account",
    options: accounts,
    searchable: true,
    searchPlaceholder: "Search destination account...",
    onAddNew: onAddAccount,
    addNewLabel: "+ Link Account",
  };

  const dateField: FormField = {
    type: "date",
    name: "date",
    label: "Date",
  };

  const notesField: FormField = {
    type: "textarea",
    name: "notes",
    label: "Notes",
    placeholder: "Optional notes...",
    autoComplete: "off",
    rows: 2,
  };

  const renderField = (field: FormField) => (
    <FormDialogField
      key={field.name}
      field={field}
      value={values[field.name] || ""}
      error={errors[field.name]}
      onChange={onChange}
    />
  );

  return (
    <div className="space-y-4">
      {renderField(amountField)}
      {renderField(kindField)}
      {values.kind === "investment" && renderField(investmentField)}
      {values.kind === "goal" && renderField(goalField)}
      {renderField(categoryField)}
      {renderField(accountField)}
      {values.kind === "transfer" && renderField(toAccountField)}
      {renderField(dateField)}
      {renderField(notesField)}
    </div>
  );
}

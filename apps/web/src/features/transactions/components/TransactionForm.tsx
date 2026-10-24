"use client";

import { TransactionKind } from "@finai/shared-types";
import { FormDialogField, FormField } from "@finai/ui";
import { UI_COPY } from "@/lib/ui-copy";

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
    label: UI_COPY.TRANSACTIONS.FORM.AMOUNT,
    placeholder: UI_COPY.TRANSACTIONS.FORM.AMOUNT_PLACEHOLDER,
    autoComplete: "off",
  };

  const kindField: FormField = {
    type: "select",
    name: "kind",
    label: UI_COPY.TRANSACTIONS.FORM.TYPE,
    options: [
      { label: UI_COPY.TRANSACTIONS.FORM.KIND_OPTIONS.EXPENSE, value: TransactionKind.EXPENSE },
      { label: UI_COPY.TRANSACTIONS.FORM.KIND_OPTIONS.INCOME, value: TransactionKind.INCOME },
      { label: UI_COPY.TRANSACTIONS.FORM.KIND_OPTIONS.TRANSFER, value: TransactionKind.TRANSFER },
      {
        label: UI_COPY.TRANSACTIONS.FORM.KIND_OPTIONS.INVESTMENT,
        value: TransactionKind.INVESTMENT,
      },
      { label: UI_COPY.TRANSACTIONS.FORM.KIND_OPTIONS.GOAL, value: TransactionKind.GOAL },
    ],
  };

  const investmentField: FormField = {
    type: "select",
    name: "investmentId",
    label: UI_COPY.TRANSACTIONS.FORM.INVESTMENT,
    options: investments,
    searchable: true,
    searchPlaceholder: UI_COPY.TRANSACTIONS.FORM.SEARCH_INVESTMENT,
    onAddNew: onAddInvestment,
    addNewLabel: UI_COPY.TRANSACTIONS.FORM.ADD_INVESTMENT,
  };

  const goalField: FormField = {
    type: "select",
    name: "goalId",
    label: UI_COPY.TRANSACTIONS.FORM.SAVINGS_GOAL,
    options: goals,
    searchable: true,
    searchPlaceholder: UI_COPY.TRANSACTIONS.FORM.SEARCH_GOAL,
    onAddNew: onAddGoal,
    addNewLabel: UI_COPY.TRANSACTIONS.FORM.ADD_GOAL,
  };

  const categoryField: FormField = {
    type: "select",
    name: "category",
    label: UI_COPY.TRANSACTIONS.FORM.CATEGORY,
    options: categories,
    searchable: true,
    searchPlaceholder: UI_COPY.TRANSACTIONS.FORM.SEARCH_CATEGORY,
    onAddNew: onAddCategory,
    addNewLabel: UI_COPY.TRANSACTIONS.FORM.ADD_CATEGORY,
  };

  const accountField: FormField = {
    type: "select",
    name: "account",
    label:
      values.kind === TransactionKind.TRANSFER
        ? UI_COPY.TRANSACTIONS.FORM.FROM_ACCOUNT
        : values.kind === TransactionKind.INVESTMENT || values.kind === TransactionKind.GOAL
          ? UI_COPY.TRANSACTIONS.FORM.PAY_FROM_ACCOUNT
          : UI_COPY.TRANSACTIONS.FORM.ACCOUNT,
    options: accounts,
    searchable: true,
    searchPlaceholder: UI_COPY.TRANSACTIONS.FORM.SEARCH_ACCOUNT,
    onAddNew: onAddAccount,
    addNewLabel: UI_COPY.TRANSACTIONS.FORM.LINK_ACCOUNT,
  };

  const toAccountField: FormField = {
    type: "select",
    name: "toAccount",
    label: UI_COPY.TRANSACTIONS.FORM.TO_ACCOUNT,
    options: accounts,
    searchable: true,
    searchPlaceholder: UI_COPY.TRANSACTIONS.FORM.SEARCH_DESTINATION_ACCOUNT,
    onAddNew: onAddAccount,
    addNewLabel: UI_COPY.TRANSACTIONS.FORM.LINK_ACCOUNT,
  };

  const dateField: FormField = {
    type: "date",
    name: "date",
    label: UI_COPY.TRANSACTIONS.FORM.DATE,
  };

  const notesField: FormField = {
    type: "textarea",
    name: "notes",
    label: UI_COPY.TRANSACTIONS.FORM.NOTES,
    placeholder: UI_COPY.TRANSACTIONS.FORM.NOTES_PLACEHOLDER,
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
      {values.kind === TransactionKind.INVESTMENT && renderField(investmentField)}
      {values.kind === TransactionKind.GOAL && renderField(goalField)}
      {renderField(categoryField)}
      {renderField(accountField)}
      {values.kind === TransactionKind.TRANSFER && renderField(toAccountField)}
      {renderField(dateField)}
      {renderField(notesField)}
    </div>
  );
}

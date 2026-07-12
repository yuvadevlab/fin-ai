import { FormDialogField, FormField } from "@finai/ui";
import { useState } from "react";

// TODO: Move Category and Account options to DB and fetch them dynamically.
const fields: FormField[] = [
  {
    type: "number",
    name: "amount",
    label: "Amount",
    placeholder: "0.00",
  },
  {
    type: "select",
    name: "kind",
    label: "Type",
    options: [
      { label: "Expense", value: "expense" },
      { label: "Income", value: "income" },
      { label: "Transfer", value: "transfer" },
    ],
  },
  {
    type: "select",
    name: "category",
    label: "Category",
    options: [
      { label: "Food & Dining", value: "food" },
      { label: "Groceries", value: "groceries" },
      { label: "Transport", value: "transport" },
      { label: "Utilities", value: "utilities" },
      { label: "Shopping", value: "shopping" },
      { label: "Entertainment", value: "entertainment" },
      { label: "Housing", value: "housing" },
      { label: "Income", value: "income" },
      { label: "Investment", value: "investment" },
    ],
  },
  {
    type: "select",
    name: "account",
    label: "Account",
    options: [
      { label: "AXIS", value: "axis" },
      { label: "HDFC", value: "hdfc" },
      { label: "SBI", value: "sbi" },
      { label: "AXIS Credit", value: "axis-credit" },
      { label: "HDFC Credit", value: "hdfc-credit" },
      { label: "ICICI Credit", value: "icici-credit" },
      { label: "SBI Credit", value: "sbi-credit" },
      { label: "Cash", value: "cash" },
    ],
  },
  {
    type: "date",
    name: "date",
    label: "Date",
  },
  {
    type: "textarea",
    name: "notes",
    label: "Notes",
    placeholder: "Optional notes...",
    rows: 3,
  },
];

export function TransactionForm() {
  const [values, setValues] = useState<Record<string, string>>({}); // TODO: Map the respective types for each field instead of using string.

  const handleChange = (name: string, value: string) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  return (
    <>
      {fields.map((field) => (
        <FormDialogField
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={handleChange}
        />
      ))}
    </>
  );
}

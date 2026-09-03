"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { FormDialogField } from "@finai/ui";
import { BulkRow } from "./BulkTransactionForm";

export interface BulkTransactionRowProps {
  row: BulkRow;
  idx: number;
  onChangeRow: (id: string, field: keyof BulkRow, value: string) => void;
  onRemoveRow: (id: string) => void;
  onAddCategory?: (initialName?: string, rowId?: string) => void;
  onAddAccount?: (initialName?: string, rowId?: string) => void;
  accounts: { label: string; value: string }[];
  categories: { label: string; value: string }[];
  errors: Record<string, string>;
  canDelete: boolean;
}

const TYPE_OPTIONS = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Transfer", value: "transfer" },
];

export function BulkTransactionRow({
  row,
  idx,
  onChangeRow,
  onRemoveRow,
  onAddCategory,
  onAddAccount,
  accounts,
  categories,
  errors,
  canDelete,
}: BulkTransactionRowProps) {
  const isTransfer = row.kind === "transfer";

  return (
    <div className="bg-card border-border/70 rounded-xl border p-4 shadow-xs">
      {/* Card Header: Row number + delete */}
      <div className="mb-3 flex items-center justify-between">
        <span className="bg-primary/10 text-primary inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 font-mono text-xs font-bold">
          #{idx + 1}
        </span>
        {canDelete && (
          <button
            type="button"
            onClick={() => onRemoveRow(row.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg p-1.5 transition-colors"
            title="Remove this entry"
          >
            <Trash2 className="size-icon-sm" />
          </button>
        )}
      </div>

      {/* Row 1: Amount (full width) */}
      <div className="mb-3">
        <FormDialogField
          field={{
            type: "number",
            name: "amount",
            label: "Amount (₹) *",
            placeholder: "0.00",
          }}
          value={row.amount}
          error={errors[`${row.id}_amount`]}
          onChange={(_name, val) => onChangeRow(row.id, "amount", val)}
        />
      </div>

      {/* Row 2: Type | Date */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <FormDialogField
          field={{
            type: "select",
            name: "kind",
            label: "Type *",
            options: TYPE_OPTIONS,
          }}
          value={row.kind}
          error={errors[`${row.id}_kind`]}
          onChange={(_name, val) => onChangeRow(row.id, "kind", val)}
        />
        <FormDialogField
          field={{
            type: "date",
            name: "date",
            label: "Date *",
          }}
          value={row.date}
          error={errors[`${row.id}_date`]}
          onChange={(_name, val) => onChangeRow(row.id, "date", val)}
        />
      </div>

      {/* Row 3: Category | Account */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormDialogField
          field={{
            type: "select",
            name: "category",
            label: "Category *",
            options: categories,
            searchable: true,
            searchPlaceholder: "Search category...",
            onAddNew: (query) => onAddCategory?.(query, row.id),
            addNewLabel: "+ Create Category",
          }}
          value={row.category}
          error={errors[`${row.id}_category`]}
          onChange={(_name, val) => onChangeRow(row.id, "category", val)}
        />
        <FormDialogField
          field={{
            type: "select",
            name: "account",
            label: isTransfer ? "From Account *" : "Account *",
            options: accounts,
            searchable: true,
            searchPlaceholder: "Search account...",
            onAddNew: (query) => onAddAccount?.(query, row.id),
            addNewLabel: "+ Link Account",
          }}
          value={row.account}
          error={errors[`${row.id}_account`]}
          onChange={(_name, val) => onChangeRow(row.id, "account", val)}
        />
      </div>

      {/* Row 4 (Transfer only): To Account */}
      {isTransfer && (
        <div className="mb-3">
          <FormDialogField
            field={{
              type: "select",
              name: "toAccount",
              label: "To Account *",
              options: accounts,
              searchable: true,
              searchPlaceholder: "Search destination...",
              onAddNew: (query) => onAddAccount?.(query, row.id),
              addNewLabel: "+ Link Account",
            }}
            value={row.toAccount ?? ""}
            error={errors[`${row.id}_toAccount`]}
            onChange={(_name, val) => onChangeRow(row.id, "toAccount", val)}
          />
        </div>
      )}

      {/* Row 5: Notes */}
      <FormDialogField
        field={{
          type: "text",
          name: "notes",
          label: "Notes",
          placeholder: "e.g. Grocery, Lunch, Uber...",
        }}
        value={row.notes}
        error={errors[`${row.id}_notes`]}
        onChange={(_name, val) => onChangeRow(row.id, "notes", val)}
      />
    </div>
  );
}

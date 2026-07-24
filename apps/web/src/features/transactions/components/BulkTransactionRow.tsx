"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { FormDialogField, TableRow, TableCell } from "@finai/ui";
import { BulkRow } from "./BulkTransactionForm";

export interface BulkTransactionRowProps {
  row: BulkRow;
  idx: number;
  onChangeRow: (id: string, field: keyof BulkRow, value: string) => void;
  onRemoveRow: (id: string) => void;
  accounts: { label: string; value: string }[];
  categories: { label: string; value: string }[];
  errors: Record<string, string>;
  canDelete: boolean;
}

export function BulkTransactionRow({
  row,
  idx,
  onChangeRow,
  onRemoveRow,
  accounts,
  categories,
  errors,
  canDelete,
}: BulkTransactionRowProps) {
  return (
    <TableRow>
      {/* Index */}
      <TableCell className="text-muted-foreground text-center font-mono font-bold">
        {idx + 1}
      </TableCell>

      {/* Amount */}
      <TableCell className="w-56">
        <FormDialogField
          field={{
            type: "number",
            name: "amount",
            label: "",
            placeholder: "0.00",
          }}
          value={row.amount}
          error={errors[`${row.id}_amount`]}
          onChange={(_name, val) => onChangeRow(row.id, "amount", val)}
        />
      </TableCell>

      {/* Type */}
      <TableCell className="w-36">
        <FormDialogField
          field={{
            type: "select",
            name: "kind",
            label: "",
            options: [
              { label: "Expense", value: "expense" },
              { label: "Income", value: "income" },
              { label: "Transfer", value: "transfer" },
            ],
          }}
          value={row.kind}
          error={errors[`${row.id}_kind`]}
          onChange={(_name, val) => onChangeRow(row.id, "kind", val)}
        />
      </TableCell>

      {/* Category */}
      <TableCell className="w-52">
        <FormDialogField
          field={{
            type: "select",
            name: "category",
            label: "",
            options: categories,
          }}
          value={row.category}
          error={errors[`${row.id}_category`]}
          onChange={(_name, val) => onChangeRow(row.id, "category", val)}
        />
      </TableCell>

      {/* Account */}
      <TableCell className="w-52">
        <FormDialogField
          field={{
            type: "select",
            name: "account",
            label: "",
            options: accounts,
          }}
          value={row.account}
          error={errors[`${row.id}_account`]}
          onChange={(_name, val) => onChangeRow(row.id, "account", val)}
        />
      </TableCell>

      {/* Date */}
      <TableCell className="w-44">
        <FormDialogField
          field={{
            type: "date",
            name: "date",
            label: "",
          }}
          value={row.date}
          error={errors[`${row.id}_date`]}
          onChange={(_name, val) => onChangeRow(row.id, "date", val)}
        />
      </TableCell>

      {/* Notes */}
      <TableCell className="min-w-[220px]">
        <FormDialogField
          field={{
            type: "text",
            name: "notes",
            label: "",
            placeholder: "e.g. Grocery, Lunch, Uber...",
          }}
          value={row.notes}
          error={errors[`${row.id}_notes`]}
          onChange={(_name, val) => onChangeRow(row.id, "notes", val)}
        />
      </TableCell>

      {/* Remove */}
      <TableCell className="text-center">
        {canDelete && (
          <button
            type="button"
            onClick={() => onRemoveRow(row.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg p-1.5 transition-colors"
            title="Remove row"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </TableCell>
    </TableRow>
  );
}

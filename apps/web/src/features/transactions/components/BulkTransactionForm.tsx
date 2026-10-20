"use client";

import React, { useRef } from "react";
import { Plus, Sparkles, Upload, Download } from "lucide-react";
import { formatINR } from "@finai/finance-engine";
import { Button } from "@finai/ui";
import { BulkTransactionRow } from "./BulkTransactionRow";
import { UI_COPY } from "@/lib/ui-copy";

export interface BulkRow {
  id: string;
  amount: string;
  kind: "expense" | "income" | "transfer";
  category: string;
  account: string;
  toAccount?: string;
  date: string;
  notes: string;
}

export interface BulkTransactionFormProps {
  rows: BulkRow[];
  onChangeRow: (id: string, field: keyof BulkRow, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onUploadExcel?: (file: File) => void;
  onDownloadTemplate?: () => void;
  onAddCategory?: (initialName?: string, rowId?: string) => void;
  onAddAccount?: (initialName?: string, rowId?: string) => void;
  accounts: { label: string; value: string }[];
  categories: { label: string; value: string }[];
  errors: Record<string, string>;
}

export function BulkTransactionForm({
  rows,
  onChangeRow,
  onAddRow,
  onRemoveRow,
  onUploadExcel,
  onDownloadTemplate,
  onAddCategory,
  onAddAccount,
  accounts,
  categories,
  errors,
}: BulkTransactionFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalAmount = rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadExcel?.(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top summary & toolbar bar */}
      <div className="bg-secondary/40 border-border/80 flex flex-col gap-3 rounded-2xl border p-3.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <Sparkles className="size-4 shrink-0" />
          </div>
          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              {UI_COPY.TRANSACTIONS.IMPORT.QUEUE_TITLE}
            </h4>
            <p className="text-muted-foreground text-[11px]">
              {UI_COPY.TRANSACTIONS.IMPORT.READY_COUNT(rows.length)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="ml-2 flex items-center gap-3 text-right">
            <span className="text-muted-foreground block text-[10px] font-semibold tracking-wider uppercase">
              {UI_COPY.TRANSACTIONS.IMPORT.BATCH_TOTAL}
            </span>
            <span className="text-foreground font-mono text-sm font-extrabold">
              {formatINR(totalAmount)}
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownloadTemplate}
              className="border-border hover:bg-secondary h-8 cursor-pointer gap-1.5 text-xs font-medium"
              title={UI_COPY.TRANSACTIONS.IMPORT.TEMPLATE_TITLE}
            >
              <Download className="text-primary size-3.5" />{" "}
              {UI_COPY.TRANSACTIONS.IMPORT.TEMPLATE_BUTTON}
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 cursor-pointer gap-1.5 text-xs font-semibold"
              title={UI_COPY.TRANSACTIONS.IMPORT.UPLOAD_TITLE}
            >
              <Upload className="size-3.5" /> {UI_COPY.TRANSACTIONS.IMPORT.UPLOAD_BUTTON}
            </Button>
          </div>
        </div>
      </div>

      {errors.root && (
        <div className="bg-destructive/15 text-destructive border-destructive/20 rounded-xl border p-3 text-xs font-semibold">
          {errors.root}
        </div>
      )}

      {/* Responsive card stack — one card per transaction entry */}
      <div className="border-border/80 bg-secondary/20 max-h-[50vh] space-y-3 overflow-y-auto rounded-2xl border p-3 shadow-xs">
        {rows.map((row, idx) => (
          <BulkTransactionRow
            key={row.id}
            row={row}
            idx={idx}
            onChangeRow={onChangeRow}
            onRemoveRow={onRemoveRow}
            onAddCategory={onAddCategory}
            onAddAccount={onAddAccount}
            accounts={accounts}
            categories={categories}
            errors={errors}
            canDelete={rows.length > 1}
          />
        ))}
      </div>

      {/* Add Row Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onAddRow}
        className="border-border/80 hover:border-primary hover:bg-secondary/50 h-10 w-full cursor-pointer gap-2 rounded-xl border-dashed text-xs font-semibold"
      >
        <Plus className="size-4" /> {UI_COPY.TRANSACTIONS.IMPORT.ADD_ENTRY}
      </Button>
    </div>
  );
}

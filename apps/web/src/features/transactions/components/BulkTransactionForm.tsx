"use client";

import React, { useRef } from "react";
import { Plus, Calendar, Sparkles, Upload, Download } from "lucide-react";
import { formatINR } from "@finai/finance-engine";
import { Button, Table, TableHeader, TableBody, TableHead, TableRow } from "@finai/ui";
import { BulkTransactionRow } from "./BulkTransactionRow";

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
  onFillTodayDate: () => void;
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
  onFillTodayDate,
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
      <div className="bg-secondary/40 border-border/80 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <Sparkles className="size-4 shrink-0" />
          </div>
          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              Bulk Upload & Import Queue
            </h4>
            <p className="text-muted-foreground text-[11px]">
              {rows.length} {rows.length === 1 ? "entry" : "entries"} ready for submit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="mr-2 text-right">
            <span className="text-muted-foreground block text-[10px] font-semibold tracking-wider uppercase">
              Batch Total
            </span>
            <span className="text-foreground font-mono text-sm font-extrabold">
              {formatINR(totalAmount)}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDownloadTemplate}
            className="border-border hover:bg-secondary h-8 cursor-pointer gap-1.5 text-xs font-medium"
            title="Download formatted Excel sheet template pre-filled with your accounts & categories"
          >
            <Download className="text-primary size-3.5" /> Template (.xlsx)
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 cursor-pointer gap-1.5 text-xs font-semibold"
            title="Upload Excel spreadsheet (.xlsx, .csv)"
          >
            <Upload className="size-3.5" /> Upload Excel
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFillTodayDate}
            className="border-border hover:bg-secondary h-8 cursor-pointer gap-1.5 text-xs"
          >
            <Calendar className="size-3.5" /> Set All Today
          </Button>
        </div>
      </div>

      {errors.root && (
        <div className="bg-destructive/15 text-destructive border-destructive/20 rounded-xl border p-3 text-xs font-semibold">
          {errors.root}
        </div>
      )}

      {/* Reusable UI Table Primitive Container */}
      <div className="border-border/80 bg-card/60 max-h-[55vh] overflow-x-auto overflow-y-auto rounded-2xl border shadow-xs">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="w-56">Amount (₹)*</TableHead>
              <TableHead className="w-36">Type*</TableHead>
              <TableHead className="w-52">Category*</TableHead>
              <TableHead className="w-52">Account*</TableHead>
              <TableHead className="w-44">Date*</TableHead>
              <TableHead className="min-w-[220px]">Notes / Description</TableHead>
              <TableHead className="w-12 text-center">Del</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
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
          </TableBody>
        </Table>
      </div>

      {/* Add Row Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onAddRow}
        className="border-border/80 hover:border-primary hover:bg-secondary/50 h-10 w-full cursor-pointer gap-2 rounded-xl border-dashed text-xs font-semibold"
      >
        <Plus className="size-4" /> Add Another Row
      </Button>
    </div>
  );
}

"use client";

import React, { useRef } from "react";
import { Plus, Sparkles, Upload, Download } from "lucide-react";
import { formatINR } from "@fin-ai/finance-engine";
import { Button } from "@fin-ai/ui";
import { TransactionKind } from "@fin-ai/shared-types";
import { BulkTransactionRow } from "./BulkTransactionRow";
import { UI_COPY } from "@/lib/ui-copy";

export interface BulkRow {
  id: string;
  amount: string;
  kind: TransactionKind;
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
    <div className="fn-form-body">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileChange}
        className="dl-sr-only"
      />

      {/* Top summary & toolbar bar */}
      <div className="fn-bulk-summary-bar">
        <div className="fn-bulk-summary-header">
          <div className="fn-bulk-summary-icon">
            <Sparkles className="fn-notifications-action-icon" />
          </div>
          <div>
            <h4 className="fn-bulk-summary-title">{UI_COPY.TRANSACTIONS.IMPORT.QUEUE_TITLE}</h4>
            <p className="fn-bulk-summary-count">
              {UI_COPY.TRANSACTIONS.IMPORT.READY_COUNT(rows.length)}
            </p>
          </div>
        </div>

        <div className="fn-bulk-summary-actions">
          <div className="fn-bulk-total-box">
            <span className="fn-bulk-total-label">{UI_COPY.TRANSACTIONS.IMPORT.BATCH_TOTAL}</span>
            <span className="fn-bulk-total-value">{formatINR(totalAmount)}</span>
          </div>

          <div className="fn-bulk-btn-group">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownloadTemplate}
              className="fn-bulk-template-btn"
              title={UI_COPY.TRANSACTIONS.IMPORT.TEMPLATE_TITLE}
            >
              <Download className="fn-notifications-action-icon fn-icon--primary" />{" "}
              {UI_COPY.TRANSACTIONS.IMPORT.TEMPLATE_BUTTON}
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="fn-bulk-upload-btn"
              title={UI_COPY.TRANSACTIONS.IMPORT.UPLOAD_TITLE}
            >
              <Upload className="fn-notifications-action-icon" />{" "}
              {UI_COPY.TRANSACTIONS.IMPORT.UPLOAD_BUTTON}
            </Button>
          </div>
        </div>
      </div>

      {errors.root && <div className="fn-form-error-banner">{errors.root}</div>}

      {/* Responsive card stack — one card per transaction entry */}
      <div className="fn-bulk-rows-container">
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
      <Button type="button" variant="outline" onClick={onAddRow} className="fn-bulk-add-row-btn">
        <Plus className="fn-notifications-action-icon" /> {UI_COPY.TRANSACTIONS.IMPORT.ADD_ENTRY}
      </Button>
    </div>
  );
}

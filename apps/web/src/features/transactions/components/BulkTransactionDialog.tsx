"use client";

import React, { useState } from "react";
import { FormDialog, toast } from "@finai/ui";
import { format } from "date-fns";
import { useCreateBulkTransactions } from "../api";
import { useInlineEntityCreation } from "../hooks";
import { TransactionKind, TransactionType } from "@finai/shared-types";
import { downloadExcelTemplateFromApi, parseExcelOrCsvFile } from "../utils";
import { BulkTransactionForm, type BulkRow } from "./BulkTransactionForm";
import { InlineEntityDialogs } from "./InlineEntityDialogs";
import { UI_COPY } from "@/lib/ui-copy";

function generateRowId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `row_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

const createEmptyRow = (
  defaultAccount: string,
  defaultCategory: string,
  todayStr: string,
  id?: string,
): BulkRow => ({
  id: id || generateRowId(),
  amount: "",
  kind: TransactionKind.EXPENSE,
  category: defaultCategory,
  account: defaultAccount,
  date: todayStr,
  notes: "",
});

export interface BulkTransactionDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  accounts: { label: string; value: string }[];
  categories: { label: string; value: string }[];
}

export function BulkTransactionDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  accounts,
  categories,
}: BulkTransactionDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const createBulk = useCreateBulkTransactions();

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const defaultAccount = accounts[0]?.value || "";
  const defaultCategory = categories[0]?.value || "";

  const [rows, setRows] = useState<BulkRow[]>(() => [
    createEmptyRow(defaultAccount, defaultCategory, todayStr),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    isAddCategoryOpen,
    setIsAddCategoryOpen,
    addCategoryInitialName,
    openAddCategory,
    handleCategoryCreated,
    isAddAccountOpen,
    setIsAddAccountOpen,
    addAccountInitialName,
    openAddAccount,
    handleAccountCreated,
  } = useInlineEntityCreation({
    onCategoryCreated: (createdCategory, targetRowId) => {
      if (targetRowId) handleChangeRow(targetRowId, "category", createdCategory.id);
    },
    onAccountCreated: (createdAccount, targetRowId) => {
      if (targetRowId) handleChangeRow(targetRowId, "account", createdAccount.id);
    },
  });

  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1];
    setRows((prev) => [
      ...prev,
      {
        id: generateRowId(),
        amount: "",
        kind: TransactionKind.EXPENSE,
        category: lastRow?.category || defaultCategory,
        account: lastRow?.account || defaultAccount,
        date: lastRow?.date || todayStr,
        notes: "",
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleChangeRow = (id: string, field: keyof BulkRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    if (errors.root) setErrors({});
  };

  const handleDownloadTemplate = async () => {
    try {
      await toast
        .promise(downloadExcelTemplateFromApi(), {
          loading: UI_COPY.TRANSACTIONS.IMPORT.GENERATE_TEMPLATE,
          success: UI_COPY.TRANSACTIONS.IMPORT.TEMPLATE_DOWNLOADED,
          error: UI_COPY.TRANSACTIONS.IMPORT.TEMPLATE_FAILED,
        })
        .unwrap();
    } catch {
      // Error toast is shown by toast.promise
    }
  };

  const handleUploadExcel = async (file: File) => {
    try {
      const importedRows = await toast
        .promise(parseExcelOrCsvFile(file, accounts, categories), {
          loading: UI_COPY.TRANSACTIONS.IMPORT.IMPORTING,
          success: (data: BulkRow[]) => UI_COPY.TRANSACTIONS.IMPORT.IMPORT_SUCCESS(data.length),
          error: (error: { message?: string }) =>
            error?.message || UI_COPY.TRANSACTIONS.IMPORT.READ_EXCEL_FAILED,
        })
        .unwrap();
      setRows(importedRows);
      setErrors({});
    } catch {
      // Error toast is shown by toast.promise
    }
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Client validation
    const invalidRows = rows.filter(
      (r) => !r.amount || parseFloat(r.amount) <= 0 || !r.category || !r.account || !r.date,
    );

    if (invalidRows.length > 0) {
      setErrors({
        root: UI_COPY.TRANSACTIONS.IMPORT.VALIDATION_FAILED,
      });
      return;
    }

    const payload = rows.map((r) => {
      const kindTypeMap: Record<TransactionKind, TransactionType> = {
        [TransactionKind.EXPENSE]: TransactionType.EXPENSE,
        [TransactionKind.INCOME]: TransactionType.INCOME,
        [TransactionKind.TRANSFER]: TransactionType.TRANSFER,
        [TransactionKind.INVESTMENT]: TransactionType.INVESTMENT,
        [TransactionKind.GOAL]: TransactionType.GOAL,
      };
      return {
        amount: parseFloat(r.amount),
        type: kindTypeMap[r.kind] || TransactionType.EXPENSE,
        categoryId: r.category,
        accountId: r.account,
        toAccountId: r.toAccount || null,
        date: r.date,
        notes: r.notes || undefined,
      };
    });

    try {
      await createBulk.mutateAsync(payload);
      setOpen?.(false);
      setRows([createEmptyRow(defaultAccount, defaultCategory, todayStr)]);
      setErrors({});
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || UI_COPY.TRANSACTIONS.IMPORT.SUBMIT_FAILED,
      });
    }
  };

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        title={UI_COPY.TRANSACTIONS.IMPORT.DIALOG_TITLE}
        description={UI_COPY.TRANSACTIONS.IMPORT.DIALOG_DESCRIPTION}
        submitLabel={UI_COPY.TRANSACTIONS.IMPORT.SAVE_ALL(rows.length)}
        loading={createBulk.isPending}
        onCancel={() => setOpen?.(false)}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl"
      >
        <BulkTransactionForm
          rows={rows}
          onChangeRow={handleChangeRow}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
          onDownloadTemplate={handleDownloadTemplate}
          onUploadExcel={handleUploadExcel}
          onAddCategory={openAddCategory}
          onAddAccount={openAddAccount}
          accounts={accounts}
          categories={categories}
          errors={errors}
        />
      </FormDialog>

      <InlineEntityDialogs
        isAddCategoryOpen={isAddCategoryOpen}
        onCategoryOpenChange={setIsAddCategoryOpen}
        addCategoryInitialName={addCategoryInitialName}
        onCategoryCreated={handleCategoryCreated}
        isAddAccountOpen={isAddAccountOpen}
        onAccountOpenChange={setIsAddAccountOpen}
        addAccountInitialName={addAccountInitialName}
        onAccountCreated={handleAccountCreated}
      />
    </>
  );
}

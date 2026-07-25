"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { useWorkspace } from "@/providers";
import { useCreateBulkTransactions } from "../api/createBulkTransactions";
import { BulkTransactionForm, BulkRow } from "./BulkTransactionForm";
import { format } from "date-fns";

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
  kind: "expense",
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

  const { workspaceId } = useWorkspace();
  const createBulk = useCreateBulkTransactions(workspaceId);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const defaultAccount = accounts[0]?.value || "";
  const defaultCategory = categories[0]?.value || "";

  const [rows, setRows] = useState<BulkRow[]>(() => [
    createEmptyRow(defaultAccount, defaultCategory, todayStr),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1];
    setRows((prev) => [
      ...prev,
      {
        id: generateRowId(),
        amount: "",
        kind: "expense",
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

  const handleFillTodayDate = () => {
    setRows((prev) => prev.map((r) => ({ ...r, date: todayStr })));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Client validation
    const invalidRows = rows.filter(
      (r) => !r.amount || parseFloat(r.amount) <= 0 || !r.category || !r.account || !r.date,
    );

    if (invalidRows.length > 0) {
      setErrors({
        root: "Please fill in valid Amount, Category, Account, and Date for all rows.",
      });
      return;
    }

    const payload = rows.map((r) => {
      const kindTypeMap: Record<string, "EXPENSE" | "INCOME" | "TRANSFER"> = {
        expense: "EXPENSE",
        income: "INCOME",
        transfer: "TRANSFER",
      };
      return {
        amount: parseFloat(r.amount),
        type: kindTypeMap[r.kind] || "EXPENSE",
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
        root: apiErr?.message || "Failed to submit bulk transactions.",
      });
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="EOD Bulk Transaction Entry"
      description="Add multiple daily expenses and income entries at once."
      submitLabel={`Save All (${rows.length}) Transactions`}
      loading={createBulk.isPending}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
      className="w-full max-w-5xl"
    >
      <BulkTransactionForm
        rows={rows}
        onChangeRow={handleChangeRow}
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
        onFillTodayDate={handleFillTodayDate}
        accounts={accounts}
        categories={categories}
        errors={errors}
      />
    </FormDialog>
  );
}

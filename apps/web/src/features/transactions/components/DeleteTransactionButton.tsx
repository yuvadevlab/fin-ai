"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button, ConfirmDialog } from "@finai/ui";

interface DeleteTransactionButtonProps {
  transactionId: string;
  onDelete: (id: string) => void;
}

/** Themed confirm dialog wrapper for deleting a transaction (replaces window.confirm). */
export function DeleteTransactionButton({ transactionId, onDelete }: DeleteTransactionButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete transaction"
        className="text-muted-foreground hover:text-destructive size-7 cursor-pointer sm:size-8"
        onClick={() => setIsConfirmOpen(true)}
      >
        <Trash2 className="size-3 sm:size-3.5" />
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        destructive
        onConfirm={() => onDelete(transactionId)}
      />
    </>
  );
}

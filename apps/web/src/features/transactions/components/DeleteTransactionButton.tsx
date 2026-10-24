"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button, ConfirmDialog } from "@finai/ui";
import { UI_COPY } from "@/lib/ui-copy";

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
        aria-label={UI_COPY.TRANSACTIONS.DELETE_BUTTON_ARIA}
        className="text-muted-foreground hover:text-destructive size-7 cursor-pointer sm:size-8"
        onClick={() => setIsConfirmOpen(true)}
      >
        <Trash2 className="size-3 sm:size-3.5" />
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={UI_COPY.TRANSACTIONS.DELETE_TITLE}
        description={UI_COPY.TRANSACTIONS.DELETE_CONFIRMATION}
        confirmText={UI_COPY.COMMON.ACTIONS.DELETE}
        destructive
        onConfirm={() => onDelete(transactionId)}
      />
    </>
  );
}

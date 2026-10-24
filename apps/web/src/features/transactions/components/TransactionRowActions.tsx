"use client";

import React, { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@finai/ui";
import { Transaction } from "../api";
import { TransactionDialog } from "./TransactionDialog";
import { UI_COPY } from "@/lib/ui-copy";

export interface TransactionRowActionsProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export function TransactionRowActions({ transaction, onDelete }: TransactionRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-7 cursor-pointer sm:size-8"
            aria-label={`Actions for transaction`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
            <Pencil className="mr-2 size-3.5" /> {UI_COPY.COMMON.ACTIONS.EDIT}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <Trash2 className="mr-2 size-3.5" /> {UI_COPY.COMMON.ACTIONS.DELETE}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransactionDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        transactionId={transaction.id}
        initialValues={transaction}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={UI_COPY.TRANSACTIONS.DELETE_TITLE}
        description={UI_COPY.TRANSACTIONS.DELETE_CONFIRMATION}
        confirmText={UI_COPY.COMMON.ACTIONS.DELETE}
        destructive
        onConfirm={() => onDelete(transaction.id)}
      />
    </>
  );
}

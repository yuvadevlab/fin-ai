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
} from "@fin-ai/ui";
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
            className="fn-action-trigger-btn"
            aria-label={UI_COPY.TRANSACTIONS.ACTIONS_ARIA}
          >
            <MoreHorizontal className="fn-notifications-action-icon" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="fn-action-dropdown">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="fn-profile-menu-item">
            <Pencil className="fn-action-menu-icon" /> {UI_COPY.COMMON.ACTIONS.EDIT}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="fn-profile-menu-item--destructive"
          >
            <Trash2 className="fn-action-menu-icon" /> {UI_COPY.COMMON.ACTIONS.DELETE}
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

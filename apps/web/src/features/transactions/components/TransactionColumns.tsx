import React from "react";
import { Badge, Button, MoneyDisplay } from "@finai/ui";
import { Edit2, Trash2 } from "lucide-react";
import { TransactionDialog } from "./TransactionDialog";
import { Transaction } from "../api/getTransactions";

export function getTransactionColumns(onDelete: (id: string) => void) {
  return [
    {
      header: "Date",
      accessor: (t: Transaction) =>
        new Date(t.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      className: "whitespace-nowrap text-muted-foreground font-normal",
    },
    {
      header: "Notes",
      accessor: (t: Transaction) => t.notes || "-",
      className: "text-muted-foreground font-normal max-w-[200px] truncate",
    },
    {
      header: "Category",
      accessor: (t: Transaction) => (
        <Badge variant="secondary" className="rounded-full font-normal">
          {t.category?.name || "Uncategorized"}
        </Badge>
      ),
    },
    {
      header: "Account",
      accessor: (t: Transaction) =>
        t.type === "TRANSFER" && t.toAccount
          ? `${t.account?.name || "Unknown"} → ${t.toAccount?.name}`
          : t.account?.name || "Unknown",
      className: "text-muted-foreground font-normal",
    },
    {
      header: "Type",
      accessor: (t: Transaction) => (
        <Badge variant="outline" className="font-normal capitalize">
          {t.type.toLowerCase()}
        </Badge>
      ),
    },
    {
      header: "Amount",
      accessor: (t: Transaction) => {
        const displayAmount = t.type === "EXPENSE" ? -t.amount : t.amount;
        return <MoneyDisplay value={displayAmount} showSign={t.type === "INCOME"} />;
      },
      className: "text-right whitespace-nowrap",
    },
    {
      header: "Actions",
      accessor: (t: Transaction) => (
        <div className="flex justify-end gap-1.5">
          <TransactionDialog
            mode="edit"
            transactionId={t.id}
            initialValues={t}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer"
              >
                <Edit2 className="size-3.5" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer"
            onClick={() => {
              if (confirm("Are you sure you want to delete this transaction?")) {
                onDelete(t.id);
              }
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];
}

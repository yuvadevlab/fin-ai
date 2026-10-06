import React from "react";
import { Badge } from "@finai/ui";
import { PrivacyMoney } from "@/components";
import { Transaction } from "../api";
import { TransactionRowActions } from "./TransactionRowActions";

export function getTransactionColumns(onDelete: (id: string) => void) {
  return [
    {
      header: "Date",
      accessor: (t: Transaction) => (
        <span className="text-muted-foreground text-xs font-normal sm:text-sm">
          {new Date(t.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      ),
      className: "whitespace-nowrap",
    },
    {
      header: "Notes",
      accessor: (t: Transaction) => (
        <span className="text-muted-foreground block max-w-37.5 truncate text-xs font-normal sm:text-sm lg:max-w-50">
          {t.notes || "-"}
        </span>
      ),
      className: "hidden md:table-cell",
    },
    {
      header: "Category",
      accessor: (t: Transaction) => (
        <div className="flex flex-col gap-0.5">
          <Badge
            variant="secondary"
            className="w-fit rounded-full text-xs font-normal whitespace-nowrap"
          >
            {t.category?.name || "Uncategorized"}
          </Badge>
          {/* Subtitle visible on mobile screens where Account column is hidden */}
          <span className="text-muted-foreground block max-w-32.5 truncate text-[11px] font-normal sm:hidden">
            {t.type === "TRANSFER" && t.toAccount
              ? `${t.account?.name || "Unknown"} → ${t.toAccount?.name}`
              : t.type === "INVESTMENT" && t.investment
                ? `${t.account?.name || "Unknown"} → ${t.investment?.name}`
                : t.type === "GOAL" && t.goal
                  ? `${t.account?.name || "Unknown"} → ${t.goal?.name}`
                  : t.account?.name || t.notes || ""}
          </span>
        </div>
      ),
      className: "min-w-[110px]",
    },
    {
      header: "Account / Destination",
      accessor: (t: Transaction) => (
        <span className="text-muted-foreground text-xs font-normal sm:text-sm">
          {t.type === "TRANSFER" && t.toAccount
            ? `${t.account?.name || "Unknown"} → ${t.toAccount?.name}`
            : t.type === "INVESTMENT" && t.investment
              ? `${t.account?.name || "Unknown"} → ${t.investment?.name}`
              : t.type === "GOAL" && t.goal
                ? `${t.account?.name || "Unknown"} → ${t.goal?.name}`
                : t.account?.name || "Unknown"}
        </span>
      ),
      className: "hidden sm:table-cell",
    },
    {
      header: "Type",
      accessor: (t: Transaction) => (
        <Badge variant="outline" className="text-xs font-normal capitalize">
          {t.type.toLowerCase()}
        </Badge>
      ),
      className: "hidden sm:table-cell",
    },
    {
      header: "Amount",
      accessor: (t: Transaction) => {
        const isOutflow = t.type === "EXPENSE" || t.type === "INVESTMENT" || t.type === "GOAL";
        const displayAmount = isOutflow ? -t.amount : t.amount;
        return (
          <PrivacyMoney
            value={displayAmount}
            showSign={t.type === "INCOME"}
            className="text-xs font-semibold sm:text-sm"
          />
        );
      },
      className: "text-right whitespace-nowrap",
    },
    {
      header: "Actions",
      accessor: (t: Transaction) => (
        <div className="flex justify-end">
          <TransactionRowActions transaction={t} onDelete={onDelete} />
        </div>
      ),
      className: "text-right whitespace-nowrap",
    },
  ];
}

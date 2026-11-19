import React from "react";
import { Badge } from "@fin-ai/ui";
import { PrivacyMoney } from "@/components";
import { TransactionType } from "@fin-ai/shared-types";
import { UI_COPY } from "@/lib/ui-copy";
import { Transaction } from "../api";
import { TransactionRowActions } from "./TransactionRowActions";

export function getTransactionColumns(onDelete?: (id: string) => void, isReadOnly = false) {
  const cols = [
    {
      header: UI_COPY.TRANSACTIONS.COLUMNS.DATE,
      accessor: (t: Transaction) => (
        <span className="fn-tx-date">
          {new Date(t.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      ),
      className: "whitespace-nowrap",
    },
    {
      header: UI_COPY.TRANSACTIONS.COLUMNS.CATEGORY,
      accessor: (t: Transaction) => (
        <Badge variant="secondary" className="fn-tx-category-badge">
          {t.category?.name || UI_COPY.TRANSACTIONS.COLUMNS.UNCATEGORIZED}
        </Badge>
      ),
      className: "whitespace-nowrap",
    },
    {
      header: UI_COPY.TRANSACTIONS.COLUMNS.ACCOUNT,
      accessor: (t: Transaction) => {
        const destination =
          t.type === TransactionType.TRANSFER && t.toAccount
            ? `${t.account?.name || UI_COPY.TRANSACTIONS.COLUMNS.UNKNOWN_ACCOUNT} → ${t.toAccount?.name}`
            : t.type === TransactionType.INVESTMENT && t.investment
              ? `${t.account?.name || UI_COPY.TRANSACTIONS.COLUMNS.UNKNOWN_ACCOUNT} → ${t.investment?.name}`
              : t.type === TransactionType.GOAL && t.goal
                ? `${t.account?.name || UI_COPY.TRANSACTIONS.COLUMNS.UNKNOWN_ACCOUNT} → ${t.goal?.name}`
                : t.account?.name || UI_COPY.TRANSACTIONS.COLUMNS.UNKNOWN_ACCOUNT;

        return (
          <div className="fn-tx-account">
            <span>{destination}</span>
            {t.user?.name && isReadOnly && (
              <span className="fn-tx-account-author">
                {UI_COPY.TRANSACTIONS.COLUMNS.AUTHOR_PREFIX} {t.user.name}
              </span>
            )}
          </div>
        );
      },
      className: "whitespace-nowrap",
    },
    {
      header: UI_COPY.TRANSACTIONS.COLUMNS.TYPE,
      accessor: (t: Transaction) => (
        <Badge variant="outline" className="fn-tx-type-badge">
          {t.type.toLowerCase()}
        </Badge>
      ),
      className: "whitespace-nowrap",
    },
    {
      header: UI_COPY.TRANSACTIONS.COLUMNS.NOTES,
      accessor: (t: Transaction) => (
        <span className="fn-tx-notes" title={t.notes || undefined}>
          {t.notes || UI_COPY.TRANSACTIONS.COLUMNS.EMPTY_NOTES}
        </span>
      ),
      className: "whitespace-nowrap",
    },
    {
      header: UI_COPY.TRANSACTIONS.COLUMNS.AMOUNT,
      accessor: (t: Transaction) => {
        const isOutflow =
          t.type === TransactionType.EXPENSE ||
          t.type === TransactionType.INVESTMENT ||
          t.type === TransactionType.GOAL;
        const displayAmount = isOutflow ? -t.amount : t.amount;
        return (
          <PrivacyMoney
            value={displayAmount}
            showSign={t.type === TransactionType.INCOME}
            className="fn-tx-amount"
          />
        );
      },
      className: "text-right whitespace-nowrap",
    },
    {
      header: UI_COPY.TRANSACTIONS.COLUMNS.ACTIONS,
      accessor: (t: Transaction) => (
        <div className="fn-tx-actions">
          {onDelete && <TransactionRowActions transaction={t} onDelete={onDelete} />}
        </div>
      ),
      className: "text-right whitespace-nowrap",
    },
  ];

  return isReadOnly || !onDelete
    ? cols.filter((c) => c.header !== UI_COPY.TRANSACTIONS.COLUMNS.ACTIONS)
    : cols;
}

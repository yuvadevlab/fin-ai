"use client";

import React from "react";
import { Pencil, Trash2, Star, MoreVertical, CreditCard } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  cn,
} from "@fin-ai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { PrivacyMoney } from "@/components";
import type { Account } from "../api";

export interface AccountCardProps {
  account: Account;
  accounts: Account[];
  isReadOnly?: boolean;
  onSetDefault: (id: string) => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onPayCard: (account: Account) => void;
}

const getAccountTypeLabel = (type: string) =>
  ({
    BANK: UI_COPY.ACCOUNTS.TYPES.BANK,
    CREDIT_CARD: UI_COPY.ACCOUNTS.TYPES.CREDIT_CARD,
    WALLET: UI_COPY.ACCOUNTS.TYPES.DIGITAL_WALLET,
    CASH: UI_COPY.ACCOUNTS.TYPES.CASH_WALLET,
  })[type] ?? type;

/**
 * Individual account card with live balances, credit card due indicators,
 * and quick-action bill settlement.
 */
export function AccountCard({
  account: a,
  accounts,
  isReadOnly,
  onSetDefault,
  onEdit,
  onDelete,
  onPayCard,
}: AccountCardProps) {
  const isCreditCard = a.type === "CREDIT_CARD";

  return (
    <div className={cn("fn-account-card", a.isDefault && "is-default")}>
      <div className="fn-account-card-header">
        <div className="fn-account-header-info">
          <div className="fn-account-avatar">{a.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className="fn-account-title-wrap">
              <p className="fn-account-name">{a.name}</p>
              {a.isDefault && (
                <span className="fn-account-default-badge">
                  <Star className="fn-account-star-icon" />
                  {UI_COPY.ACCOUNTS.DEFAULT_BADGE}
                </span>
              )}
            </div>
            <p className="fn-account-type">{getAccountTypeLabel(a.type)}</p>
          </div>
        </div>

        {/* Actions Dropdown Menu */}
        {!isReadOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="fn-account-menu-trigger"
                aria-label={`Actions for ${a.name}`}
              >
                <MoreVertical className="fn-icon-md" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="fn-account-menu-content">
              {!a.isDefault && accounts.length > 1 && (
                <DropdownMenuItem
                  onClick={() => onSetDefault(a.id)}
                  className="fn-account-menu-item"
                >
                  <Star className="fn-account-menu-icon" /> {UI_COPY.ACCOUNTS.SET_DEFAULT_ACTION}
                </DropdownMenuItem>
              )}
              {isCreditCard && a.balance < 0 && (
                <DropdownMenuItem onClick={() => onPayCard(a)} className="fn-account-menu-item">
                  <CreditCard className="fn-account-menu-icon" />{" "}
                  {UI_COPY.ACCOUNTS.PAY_CARD_BILL_ACTION}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(a)} className="fn-account-menu-item">
                <Pencil className="fn-account-menu-icon" /> {UI_COPY.ACCOUNTS.EDIT_ACTION}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(a)}
                className="fn-account-menu-item-destructive"
              >
                <Trash2 className="fn-account-menu-icon" /> {UI_COPY.ACCOUNTS.DELETE_ACTION}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Account Balance */}
      <div className="fn-account-balance">
        {isCreditCard && (
          <span className={cn("fn-account-due-label", a.balance < 0 ? "is-due" : "is-settled")}>
            {a.balance < 0
              ? UI_COPY.ACCOUNTS.CREDIT_CARD_DUES
              : a.balance === 0
                ? UI_COPY.ACCOUNTS.CREDIT_CARD_NO_DUES
                : UI_COPY.ACCOUNTS.CREDIT_CARD_PREPAID}
          </span>
        )}
        <p className="fn-account-balance-val">
          <PrivacyMoney value={a.balance} className={cn(a.balance < 0 && "is-negative")} />
        </p>
      </div>

      {/* Status Footer */}
      <div className="fn-account-card-footer">
        <span className="fn-account-status">{UI_COPY.ACCOUNTS.ACTIVE_STATUS}</span>
        {isCreditCard && a.balance < 0 && !isReadOnly ? (
          <Button
            size="sm"
            variant="outline"
            className="fn-account-pay-btn"
            onClick={() => onPayCard(a)}
          >
            <CreditCard className="fn-icon-sm" />
            {UI_COPY.ACCOUNTS.PAY_CARD_BILL_ACTION}
          </Button>
        ) : (
          <span className="fn-account-currency">{a.currency}</span>
        )}
      </div>
    </div>
  );
}

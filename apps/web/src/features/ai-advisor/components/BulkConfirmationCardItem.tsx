"use client";

import { Calendar, Check, CreditCard, FileText, Tag, X } from "lucide-react";
import { cn } from "@fin-ai/ui";
import { usePrivacyMode } from "@/hooks";
import { UI_COPY } from "@/lib/ui-copy";
import { AgentConfirmationStatus, TransactionType } from "@fin-ai/shared-types";
import type { BulkTransactionItem } from "../utils/parseBulkRows";

export interface BulkConfirmationCardItemProps {
  item: BulkTransactionItem;
  index: number;
  totalCount: number;
  itemStatus: AgentConfirmationStatus;
}

const TYPE_STYLES: Record<string, { badge: string; modifier: string }> = {
  [TransactionType.INCOME]: {
    badge: "fn-status-executed",
    modifier: "fn-bulk-card--income",
  },
  [TransactionType.EXPENSE]: {
    badge: "fn-status-failed",
    modifier: "fn-bulk-card--expense",
  },
  [TransactionType.TRANSFER]: {
    badge: "fn-status-pending",
    modifier: "fn-bulk-card--transfer",
  },
  [TransactionType.INVESTMENT]: {
    badge: "fn-status-executed",
    modifier: "fn-bulk-card--investment",
  },
  [TransactionType.GOAL]: {
    badge: "fn-status-pending",
    modifier: "fn-bulk-card--goal",
  },
};

export function BulkConfirmationCardItem({
  item,
  index,
  totalCount,
  itemStatus,
}: BulkConfirmationCardItemProps) {
  const typeStyle = TYPE_STYLES[item.type.toUpperCase()] ?? TYPE_STYLES[TransactionType.EXPENSE];
  const { isPrivacyMode } = usePrivacyMode();
  const mask = (v: string) => (isPrivacyMode ? "••••••" : v);
  const maskAmount = (v: string) => (isPrivacyMode ? "₹ ••••••" : v);

  return (
    <div
      data-card-index={index}
      className={cn(
        "fn-bulk-card",
        typeStyle.modifier,
        itemStatus === AgentConfirmationStatus.REJECTED && "fn-bulk-card--rejected",
        itemStatus === AgentConfirmationStatus.EXECUTED && "fn-bulk-card--executed",
      )}
    >
      <div className="fn-bulk-card-header">
        <span className="fn-bulk-card-index">
          #{index + 1} of {totalCount}
        </span>
        <span className={cn("fn-bulk-card-badge", typeStyle.badge)}>{item.type}</span>
      </div>

      <div className="fn-bulk-card-amount-wrap">
        <p className="fn-bulk-card-amount">{maskAmount(item.amount)}</p>
      </div>

      <div className="fn-bulk-card-meta-list">
        <div className="fn-bulk-card-meta-row">
          <Tag className="fn-bulk-card-meta-icon" />
          <span className="fn-bulk-card-category-pill">{item.category}</span>
        </div>
        <div className="fn-bulk-card-meta-row">
          <CreditCard className="fn-bulk-card-meta-icon" />
          <span className="fn-bulk-card-meta-text">{mask(item.account)}</span>
        </div>
        <div className="fn-bulk-card-meta-row">
          <Calendar className="fn-bulk-card-meta-icon" />
          <span className="fn-bulk-card-meta-text">{item.date}</span>
        </div>
        {item.notes && (
          <div className="fn-bulk-card-meta-row">
            <FileText className="fn-bulk-card-meta-icon" />
            <span className="fn-bulk-card-meta-text">"{item.notes}"</span>
          </div>
        )}
      </div>

      {/* Status badge — only shown for resolved items */}
      {itemStatus !== AgentConfirmationStatus.PENDING && (
        <div className="fn-bulk-card-footer">
          {itemStatus === AgentConfirmationStatus.EXECUTED ? (
            <span className="fn-bulk-card-status--executed">
              <Check className="fn-bulk-card-status-icon" />{" "}
              {UI_COPY.ADVISOR.CONFIRMATION_STATUS.RECORDED}
            </span>
          ) : (
            <span className="fn-bulk-card-status--rejected">
              <X className="fn-bulk-card-status-icon" />{" "}
              {UI_COPY.ADVISOR.CONFIRMATION_STATUS.CANCELLED}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

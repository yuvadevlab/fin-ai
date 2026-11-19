"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Layers, Loader2, X } from "lucide-react";
import { Button, cn } from "@fin-ai/ui";
import { formatINR } from "@fin-ai/finance-engine";
import { usePrivacyMode } from "@/hooks";
import { useWorkspace } from "@/providers";
import { AgentConfirmationStatus } from "@fin-ai/shared-types";
import type { AgentConfirmation } from "../api/agentTypes";
import { parseBulkRows, type BulkTransactionItem } from "../utils/parseBulkRows";
import { BulkConfirmationCardItem } from "./BulkConfirmationCardItem";
import { useCarouselScroll } from "./useCarouselScroll";
import { UI_COPY } from "@/lib/ui-copy";

interface BulkConfirmationCarouselProps {
  confirmation: AgentConfirmation;
  onConfirm: (actionId: string, tool: string, itemIndex?: number) => Promise<unknown> | void;
  onReject: (actionId: string, itemIndex?: number) => Promise<unknown> | void;
  disabled?: boolean;
  isExecuting?: boolean;
}

export function BulkConfirmationCarousel({
  confirmation,
  onConfirm,
  onReject,
  disabled = false,
  isExecuting = false,
}: BulkConfirmationCarouselProps) {
  const { card, status, actionId, tool } = confirmation;
  const { total, items } = parseBulkRows(card.rows ?? []);

  const [itemStatuses, setItemStatuses] = useState<Record<number, AgentConfirmationStatus>>({});

  const { scrollRef, scrollState, updateScrollState, handlePrev, handleNext } = useCarouselScroll(
    items.length,
  );

  const getItemStatus = (idx: number): AgentConfirmationStatus => {
    if (status === AgentConfirmationStatus.EXECUTED) return AgentConfirmationStatus.EXECUTED;
    if (status === AgentConfirmationStatus.REJECTED) return AgentConfirmationStatus.REJECTED;
    return itemStatuses[idx] ?? AgentConfirmationStatus.PENDING;
  };

  const pendingItems = items
    .map((it, i) => ({ it, i }))
    .filter(({ i }) => getItemStatus(i) === AgentConfirmationStatus.PENDING);
  const pendingCount = pendingItems.length;
  const executedCount = items.filter(
    (_, i) => getItemStatus(i) === AgentConfirmationStatus.EXECUTED,
  ).length;
  const rejectedCount = items.filter(
    (_, i) => getItemStatus(i) === AgentConfirmationStatus.REJECTED,
  ).length;
  const isAllResolved = pendingCount === 0;

  const pendingSum = pendingItems.reduce(
    (sum, { it }) => sum + (parseFloat(it.amount.replace(/[^0-9.-]+/g, "")) || 0),
    0,
  );
  const displayTotal = pendingCount === items.length ? total : formatINR(pendingSum);
  const { isPrivacyMode } = usePrivacyMode();
  const { isReadOnly } = useWorkspace();
  const maskedTotal = isPrivacyMode ? "₹ ••••••" : displayTotal;

  const handleConfirmAll = async () => {
    if (disabled || isExecuting || isReadOnly) return;
    await onConfirm(actionId, tool);
    setItemStatuses((prev) => {
      const next = { ...prev };
      items.forEach((_, i) => {
        if (next[i] !== AgentConfirmationStatus.REJECTED)
          next[i] = AgentConfirmationStatus.EXECUTED;
      });
      return next;
    });
  };

  const handleRejectAll = async () => {
    if (disabled || isExecuting) return;
    await onReject(actionId);
    setItemStatuses((prev) => {
      const next = { ...prev };
      items.forEach((_, i) => {
        if (next[i] !== AgentConfirmationStatus.EXECUTED)
          next[i] = AgentConfirmationStatus.REJECTED;
      });
      return next;
    });
  };

  const visibleRangeLabel =
    scrollState.firstVisible === scrollState.lastVisible
      ? `${scrollState.firstVisible + 1} of ${items.length}`
      : `${scrollState.firstVisible + 1}–${scrollState.lastVisible + 1} of ${items.length}`;

  return (
    <div className="fn-bulk-confirm-container">
      {/* Header bar */}
      <div className="fn-bulk-confirm-header">
        <div className="fn-bulk-confirm-header-left">
          <div className="fn-bulk-confirm-header-icon-wrap">
            <Layers className="fn-bulk-confirm-header-icon" aria-hidden="true" />
          </div>
          <div>
            <p className="fn-bulk-confirm-header-title">
              {!isAllResolved
                ? UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.RECORD_TRANSACTIONS(pendingCount)
                : UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.BATCH_TRANSACTIONS}
            </p>
            <p className="fn-bulk-confirm-header-subtitle">
              {UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.TOTAL}{" "}
              <span className="fn-bulk-confirm-total-val">{maskedTotal}</span>
            </p>
          </div>
        </div>

        {/* Action buttons & Nav in header */}
        <div className="fn-bulk-confirm-header-actions">
          {scrollState.hasOverflow && (
            <div className="fn-bulk-confirm-carousel-nav">
              <Button
                variant="ghost"
                size="icon"
                className="fn-bulk-confirm-nav-btn"
                disabled={!scrollState.canScrollLeft}
                onClick={handlePrev}
                aria-label={UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.PREVIOUS}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="fn-bulk-confirm-nav-counter">{visibleRangeLabel}</span>
              <Button
                variant="ghost"
                size="icon"
                className="fn-bulk-confirm-nav-btn"
                disabled={!scrollState.canScrollRight}
                onClick={handleNext}
                aria-label={UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.NEXT}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}

          {!isAllResolved ? (
            <div className="fn-bulk-confirm-bulk-actions">
              <Button
                size="sm"
                className="fn-bulk-confirm-all-btn"
                disabled={disabled || isExecuting || isReadOnly}
                onClick={handleConfirmAll}
              >
                {isExecuting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                {UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.CONFIRM_ALL(pendingCount)}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="fn-bulk-cancel-all-btn"
                disabled={disabled || isExecuting}
                onClick={handleRejectAll}
              >
                <X className="size-3.5" />
                {UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.CANCEL_ALL}
              </Button>
            </div>
          ) : (
            <span
              className={cn(
                "fn-bulk-confirm-status-pill",
                rejectedCount === items.length ? "is-rejected" : "is-executed",
              )}
            >
              {rejectedCount === items.length
                ? UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.CANCELLED
                : executedCount === items.length
                  ? UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.ALL_RECORDED
                  : UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.RESOLVED_COUNTS(
                      executedCount,
                      rejectedCount,
                    )}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="fn-bulk-confirm-scroll-track"
        tabIndex={0}
        role="region"
        aria-label={UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.A11Y_LABEL}
      >
        {items.map((tx: BulkTransactionItem, idx: number) => (
          <BulkConfirmationCardItem
            key={idx}
            item={tx}
            index={idx}
            totalCount={items.length}
            itemStatus={getItemStatus(idx)}
          />
        ))}
      </div>

      {/* Footer hint */}
      {!isAllResolved && (
        <p className={cn("fn-bulk-confirm-footer-hint", isReadOnly && "is-error")}>
          {isReadOnly
            ? UI_COPY.WORKSPACES.READ_ONLY_BANNER
            : UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.FOOTER_HINT}
        </p>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Layers, Loader2, X } from "lucide-react";
import { Button, cn } from "@finai/ui";
import { formatINR } from "@finai/finance-engine";
import { usePrivacyMode } from "@/hooks";
import type { AgentConfirmation } from "../api/agentTypes";
import { parseBulkRows, type BulkTransactionItem } from "../utils/parseBulkRows";
import { BulkConfirmationCardItem } from "./BulkConfirmationCardItem";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const [itemStatuses, setItemStatuses] = useState<
    Record<number, "pending" | "executed" | "rejected">
  >({});

  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    hasOverflow: false,
    firstVisible: 0,
    lastVisible: Math.max(0, items.length - 1),
  });

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const hasOverflow = maxScroll > 8;
    const canScrollLeft = hasOverflow && scrollLeft > 8;
    const canScrollRight = hasOverflow && scrollLeft < maxScroll - 8;

    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) {
      setScrollState({
        canScrollLeft: false,
        canScrollRight: false,
        hasOverflow: false,
        firstVisible: 0,
        lastVisible: 0,
      });
      return;
    }

    const containerLeft = el.getBoundingClientRect().left;
    const containerRight = el.getBoundingClientRect().right;

    let first = 0;
    let last = children.length - 1;
    let foundFirst = false;

    children.forEach((child, idx) => {
      const rect = child.getBoundingClientRect();
      const isVisible = rect.right > containerLeft + 20 && rect.left < containerRight - 20;
      if (isVisible) {
        if (!foundFirst) {
          first = idx;
          foundFirst = true;
        }
        last = idx;
      }
    });

    setScrollState({
      canScrollLeft,
      canScrollRight,
      hasOverflow,
      firstVisible: first,
      lastVisible: last,
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState, items.length]);

  const getItemStatus = (idx: number): "pending" | "executed" | "rejected" => {
    if (status === "executed") return "executed";
    if (status === "rejected") return "rejected";
    return itemStatuses[idx] ?? "pending";
  };

  const pendingItems = items
    .map((it, i) => ({ it, i }))
    .filter(({ i }) => getItemStatus(i) === "pending");
  const pendingCount = pendingItems.length;
  const executedCount = items.filter((_, i) => getItemStatus(i) === "executed").length;
  const rejectedCount = items.filter((_, i) => getItemStatus(i) === "rejected").length;
  const isAllResolved = pendingCount === 0;

  const pendingSum = pendingItems.reduce(
    (sum, { it }) => sum + (parseFloat(it.amount.replace(/[^0-9.-]+/g, "")) || 0),
    0,
  );
  const displayTotal = pendingCount === items.length ? total : formatINR(pendingSum);
  const { isPrivacyMode } = usePrivacyMode();
  const maskedTotal = isPrivacyMode ? "₹ ••••••" : displayTotal;

  const handleConfirmAll = async () => {
    if (disabled || isExecuting) return;
    await onConfirm(actionId, tool);
    setItemStatuses((prev) => {
      const next = { ...prev };
      items.forEach((_, i) => {
        if (next[i] !== "rejected") next[i] = "executed";
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
        if (next[i] !== "executed") next[i] = "rejected";
      });
      return next;
    });
  };

  const handlePrev = () => {
    scrollRef.current?.scrollBy({
      left: -Math.max(260, Math.floor((scrollRef.current?.clientWidth || 300) * 0.6)),
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    scrollRef.current?.scrollBy({
      left: Math.max(260, Math.floor((scrollRef.current?.clientWidth || 300) * 0.6)),
      behavior: "smooth",
    });
  };

  const visibleRangeLabel =
    scrollState.firstVisible === scrollState.lastVisible
      ? `${scrollState.firstVisible + 1} of ${items.length}`
      : `${scrollState.firstVisible + 1}–${scrollState.lastVisible + 1} of ${items.length}`;

  return (
    <div className="bg-card ring-border/60 animate-in slide-in-from-bottom-2 rounded-xl border p-3.5 shadow-sm">
      {/* Header bar */}
      <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
            <Layers className="text-primary size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold">
              {!isAllResolved
                ? `Record ${pendingCount} transaction${pendingCount > 1 ? "s" : ""}`
                : "Batch transactions"}
            </p>
            <p className="text-muted-foreground text-xs font-medium">
              Total: <span className="text-foreground font-semibold">{maskedTotal}</span>
            </p>
          </div>
        </div>

        {/* Action buttons & Nav in header */}
        <div className="flex items-center gap-1.5">
          {scrollState.hasOverflow && (
            <div className="mr-1 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={!scrollState.canScrollLeft}
                onClick={handlePrev}
                aria-label="Previous"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-muted-foreground text-xs font-medium tabular-nums">
                {visibleRangeLabel}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={!scrollState.canScrollRight}
                onClick={handleNext}
                aria-label="Next"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}

          {!isAllResolved ? (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-8 cursor-pointer gap-1.5 px-3 text-xs"
                disabled={disabled || isExecuting}
                onClick={handleConfirmAll}
              >
                {isExecuting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                Confirm All ({pendingCount})
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs"
                disabled={disabled || isExecuting}
                onClick={handleRejectAll}
              >
                <X className="size-3.5" />
                Cancel All
              </Button>
            </div>
          ) : (
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                rejectedCount === items.length
                  ? "border-border/60 bg-muted/40 text-muted-foreground"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}
            >
              {rejectedCount === items.length
                ? "✕ Cancelled"
                : executedCount === items.length
                  ? "✓ All recorded"
                  : `✓ ${executedCount} recorded, ${rejectedCount} cancelled`}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pt-3.5 pb-1"
        tabIndex={0}
        role="region"
        aria-label="Transaction cards carousel"
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
        <p className="text-muted-foreground mt-2 text-[11px] font-medium">
          Confirm or cancel individual cards above, or record all remaining items in one click.
        </p>
      )}
    </div>
  );
}

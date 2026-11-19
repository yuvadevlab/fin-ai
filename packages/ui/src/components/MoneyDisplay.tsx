import React from "react";
import { cn } from "../lib/utils";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

export interface MoneyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  currency?: string;
  showSign?: boolean;
  masked?: boolean;
  maskPlaceholder?: string;
}

export function MoneyDisplay({
  value,
  currency = "INR",
  showSign = false,
  masked = false,
  maskPlaceholder = "••••••",
  className,
  ...props
}: MoneyDisplayProps) {
  const isNegative = value < 0;
  const isPositive = value > 0;
  const absValue = Math.abs(value);
  const showDecimals = Number(absValue.toFixed(2)) % 1 !== 0;
  const formatted = absValue.toLocaleString("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  const sign = isNegative ? "-" : showSign && isPositive ? "+" : "";

  let displayContent: React.ReactNode;
  if (masked) {
    const symbol =
      new Intl.NumberFormat("en-IN", { style: "currency", currency })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value || "₹";
    displayContent = (
      <>
        <span className="dl-sr-only">{UI_COPY_CONSTANTS.MONEY_DISPLAY.HIDDEN_ARIA}</span>
        <span aria-hidden="true">
          {sign}
          {symbol}&nbsp;{maskPlaceholder}
        </span>
      </>
    );
  } else {
    displayContent = (
      <>
        {sign}
        {formatted}
      </>
    );
  }

  return (
    <span
      data-privacy-sensitive
      suppressHydrationWarning
      className={cn(
        "fn-money-display",
        isNegative && "is-negative",
        showSign && isPositive && "is-positive",
        className,
      )}
      {...props}
    >
      {displayContent}
    </span>
  );
}

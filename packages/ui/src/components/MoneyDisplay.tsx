import React from "react";
import { cn } from "../lib/utils";

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
        <span className="sr-only">Amount hidden for privacy</span>
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
      className={cn(
        "font-semibold tabular-nums",
        isNegative
          ? "text-destructive"
          : showSign && isPositive
            ? "text-primary"
            : "text-foreground",
        className,
      )}
      {...props}
    >
      {displayContent}
    </span>
  );
}

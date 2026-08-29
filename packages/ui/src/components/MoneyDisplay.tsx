import React from "react";
import { cn } from "../lib/utils";

interface MoneyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  currency?: string;
  showSign?: boolean;
}

export function MoneyDisplay({
  value,
  currency = "INR",
  showSign = false,
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

  return (
    <span
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
      {sign}
      {formatted}
    </span>
  );
}

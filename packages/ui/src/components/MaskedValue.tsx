import React from "react";
import { cn } from "../lib/utils";

export interface MaskedValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: React.ReactNode;
  masked?: boolean;
  maskPlaceholder?: string;
  prefix?: string;
  suffix?: string;
}

export function MaskedValue({
  value,
  masked = false,
  maskPlaceholder = "••••••",
  prefix,
  suffix,
  className,
  ...props
}: MaskedValueProps) {
  return (
    <span data-privacy-sensitive className={cn("tabular-nums", className)} {...props}>
      {prefix}
      {masked ? (
        <>
          <span className="sr-only">Value hidden for privacy</span>
          <span aria-hidden="true">{maskPlaceholder}</span>
        </>
      ) : (
        value
      )}
      {suffix}
    </span>
  );
}

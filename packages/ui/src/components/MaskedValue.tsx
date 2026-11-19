import React from "react";
import { cn } from "../lib/utils";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

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
    <span data-privacy-sensitive className={cn("fn-tabular-nums", className)} {...props}>
      {prefix}
      {masked ? (
        <>
          <span className="dl-sr-only">{UI_COPY_CONSTANTS.MASKED_VALUE.HIDDEN_ARIA}</span>
          <span aria-hidden="true">{maskPlaceholder}</span>
        </>
      ) : (
        value
      )}
      {suffix}
    </span>
  );
}

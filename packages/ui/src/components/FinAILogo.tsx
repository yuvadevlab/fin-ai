import React from "react";
import { ChartNoAxesCombined } from "lucide-react";
import { cn } from "../lib/utils";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

export interface FinAILogoProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
  showName?: boolean;
  animated?: boolean;
  markClassName?: string;
}

export function FinAILogo({
  compact = false,
  showName = true,
  animated: _animated = false,
  markClassName,
  className,
  ...props
}: FinAILogoProps) {
  return (
    <div className={cn("finai-brand-logo", className)} {...props}>
      <div
        className={cn(
          "finai-brand-logo-mark",
          compact && "finai-brand-logo-mark--compact",
          markClassName,
        )}
        aria-hidden="true"
      >
        <ChartNoAxesCombined
          className={cn("finai-brand-logo-icon", compact && "finai-brand-logo-icon--compact")}
          aria-hidden="true"
        />
      </div>
      {showName && <span className="finai-brand-logo-text">{UI_COPY_CONSTANTS.BRAND.NAME}</span>}
    </div>
  );
}

import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@yuva-devlab/ui";
import { cn } from "../lib/utils";

export interface InfoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: React.ReactNode;
  "aria-label": string;
}

export const InfoButton = React.forwardRef<HTMLButtonElement, InfoButtonProps>(
  ({ tooltip, className, type = "button", ...props }, ref) => {
    const button = (
      <button ref={ref} type={type} className={cn("finai-info-btn", className)} {...props}>
        <Info className="finai-info-btn-icon" aria-hidden="true" />
      </button>
    );

    if (!tooltip) {
      return button;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

InfoButton.displayName = "InfoButton";

"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@fin-ai/ui";
import { usePrivacyMode, useIsClient } from "@/hooks";
import { UI_COPY } from "@/lib/ui-copy";

interface PrivacyToggleProps {
  className?: string;
  variant?: "ghost" | "outline";
  size?: "icon" | "sm" | "default";
}

export function PrivacyToggle({ className, variant = "ghost", size = "icon" }: PrivacyToggleProps) {
  const isClient = useIsClient();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode();
  const activePrivacy = isClient && isPrivacyMode;
  const toggleLabel = activePrivacy
    ? UI_COPY.COMMON.A11Y.DISABLE_PRIVACY
    : UI_COPY.COMMON.A11Y.ENABLE_PRIVACY;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={togglePrivacyMode}
            className={cn("fn-privacy-toggle-btn", className)}
            aria-label={toggleLabel}
          >
            {activePrivacy ? (
              <EyeOff className="fn-privacy-toggle-icon--active" />
            ) : (
              <Eye className="fn-privacy-toggle-icon" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="fn-privacy-toggle-tooltip">{toggleLabel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

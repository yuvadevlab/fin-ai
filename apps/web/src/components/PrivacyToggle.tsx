"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@finai/ui";
import { usePrivacyMode } from "@/hooks";

interface PrivacyToggleProps {
  className?: string;
  variant?: "ghost" | "outline";
  size?: "icon" | "sm" | "default";
}

export function PrivacyToggle({ className, variant = "ghost", size = "icon" }: PrivacyToggleProps) {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode();

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={togglePrivacyMode}
            className={className}
            aria-label={isPrivacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
          >
            {isPrivacyMode ? (
              <EyeOff className="text-primary size-4" />
            ) : (
              <Eye className="text-muted-foreground hover:text-foreground size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {isPrivacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@finai/ui";
import { usePrivacyMode, useIsClient } from "@/hooks";

interface PrivacyToggleProps {
  className?: string;
  variant?: "ghost" | "outline";
  size?: "icon" | "sm" | "default";
}

export function PrivacyToggle({ className, variant = "ghost", size = "icon" }: PrivacyToggleProps) {
  const isClient = useIsClient();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode();
  const activePrivacy = isClient && isPrivacyMode;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={togglePrivacyMode}
            className={cn("size-10", className)}
            aria-label={activePrivacy ? "Disable Privacy Mode" : "Enable Privacy Mode"}
          >
            {activePrivacy ? (
              <EyeOff className="text-primary size-4" />
            ) : (
              <Eye className="text-muted-foreground hover:text-foreground size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {activePrivacy ? "Disable Privacy Mode" : "Enable Privacy Mode"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

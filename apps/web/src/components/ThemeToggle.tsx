"use client";

/**
 * @file apps/web/src/components/ThemeToggle.tsx
 * @description Header action button toggling light and dark theme mode.
 * @module @fin-ai/web/components/ThemeToggle
 */

import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button, cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@fin-ai/ui";
import { useAppearance, useIsClient, useTheme } from "@/hooks";
import { UI_COPY } from "@/lib/ui-copy";

interface ThemeToggleProps {
  className?: string;
  variant?: "ghost" | "outline";
  size?: "icon" | "sm" | "default";
}

export function ThemeToggle({
  className,
  variant = "ghost",
  size = "icon",
}: ThemeToggleProps): React.JSX.Element {
  const isClient = useIsClient();
  const theme = useTheme();
  const { apply } = useAppearance();

  const isDark = isClient && theme === "dark";
  const toggleLabel = isDark
    ? UI_COPY.COMMON.A11Y.SWITCH_TO_LIGHT
    : UI_COPY.COMMON.A11Y.SWITCH_TO_DARK;

  const handleToggle = () => {
    const currentlyDark =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "finai-dark";
    apply({ theme: currentlyDark ? "Light" : "Dark" });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleToggle}
            className={cn("fn-theme-toggle-btn", className)}
            aria-label={toggleLabel}
          >
            {isDark ? (
              <Sun className="fn-theme-toggle-icon" />
            ) : (
              <Moon className="fn-theme-toggle-icon" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="fn-theme-toggle-tooltip">{toggleLabel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

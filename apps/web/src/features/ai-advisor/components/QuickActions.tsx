"use client";

import { cn } from "@fin-ai/ui";
import { QUICK_ACTIONS } from "../constants/quickActions";

interface QuickActionsProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
  className?: string;
  /** "grid" = dense two-column Context panel; "chips" = horizontal pill row. */
  variant?: "grid" | "chips";
}

/**
 * Renders the quick-action entry points. `chips` is the compact horizontal
 * row used above the composer / empty state; `grid` is the denser two-column
 * layout used by the right-side Context panel (label + hint each). Clicking
 * one sends the pre-crafted intent message — always grounded in a real tool.
 */
export function QuickActions({
  onSelect,
  disabled,
  className,
  variant = "grid",
}: QuickActionsProps) {
  return (
    <div
      className={cn(
        "fn-quick-actions",
        variant === "chips" ? "fn-quick-actions--chips" : "fn-quick-actions--grid",
        className,
      )}
    >
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(action.message)}
          className={cn(
            variant === "chips" ? "fn-quick-actions-chip" : "fn-quick-actions-card",
            disabled && "is-disabled",
          )}
        >
          <span
            className={
              variant === "chips" ? "fn-quick-actions-chip-content" : "fn-quick-actions-card-title"
            }
          >
            <action.icon
              className={cn(variant === "chips" ? "fn-icon-sm" : "fn-quick-actions-card-icon")}
              aria-hidden="true"
            />
            <span>{action.label}</span>
          </span>
          {action.hint && variant === "grid" && (
            <span className="fn-quick-actions-card-hint">{action.hint}</span>
          )}
        </button>
      ))}
    </div>
  );
}

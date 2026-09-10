"use client";

import { cn } from "@finai/ui";
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
        "flex gap-2",
        variant === "chips" ? "flex-wrap" : "grid grid-cols-2",
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
            variant === "chips"
              ? "bg-card hover:bg-accent hover:text-accent-foreground border-border/70 text-muted-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95"
              : "bg-primary/5 hover:bg-primary/10 border-border/60 hover:border-primary/30 text-muted-foreground hover:text-foreground flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border px-2.5 py-2 text-left transition active:scale-95",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <span
            className={
              variant === "chips"
                ? "inline-flex items-center gap-1.5"
                : "inline-flex items-center gap-1.5 text-xs font-semibold"
            }
          >
            <action.icon
              className={cn("shrink-0", variant === "chips" ? "size-3.5" : "text-primary size-3.5")}
              aria-hidden="true"
            />
            <span>{action.label}</span>
          </span>
          {action.hint && variant === "grid" && (
            <span className="text-muted-foreground/80 text-[10px] leading-tight">
              {action.hint}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/EmptyState.tsx
 * @description Landing view for empty AI Advisor conversations with quick action prompt triggers.
 * @module @finai/web/features/ai-advisor/components/EmptyState
 */

import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@finai/ui";
import { UI_COPY } from "@/lib";
import { QUICK_ACTIONS } from "@/features/ai-advisor";

/** Props configuration for the {@link EmptyState} component */
export interface EmptyStateProps {
  /** Callback fired when a quick-action prompt is selected */
  onSelect: (message: string) => void;
  /** Optional custom CSS class name */
  className?: string;
}

/**
 * Landing state for the Advisor when the conversation is empty.
 * Displays quick-action starter chips and guidance on what the AI agent can accomplish.
 */
export function EmptyState({ onSelect, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-6 py-10 text-center",
        className,
      )}
    >
      {/* Hero identity */}
      <div className="flex flex-col items-center gap-2.5">
        <div className="bg-primary/10 flex size-14 items-center justify-center rounded-2xl">
          <Sparkles className="text-primary size-7" aria-hidden="true" />
        </div>
        <h2 className="text-foreground mt-1 text-xl font-semibold tracking-tight">
          {UI_COPY.ADVISOR.EMPTY_STATE.TITLE}
        </h2>
        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
          {UI_COPY.ADVISOR.EMPTY_STATE.SUBTITLE}
        </p>
      </div>

      {/* Action starter chips — first four quick actions */}
      <div className="grid w-full max-w-md grid-cols-2 gap-2">
        {QUICK_ACTIONS.slice(0, 4).map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onSelect(action.message)}
            className="bg-card hover:bg-accent hover:text-accent-foreground border-border/70 text-muted-foreground group flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition active:scale-95"
          >
            <span className="inline-flex items-center gap-2">
              <action.icon className="text-primary size-4 shrink-0" aria-hidden="true" />
              <span>{action.label}</span>
            </span>
            <ArrowRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
          </button>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">{UI_COPY.ADVISOR.EMPTY_STATE.OR_ASK_BELOW}</p>
    </div>
  );
}

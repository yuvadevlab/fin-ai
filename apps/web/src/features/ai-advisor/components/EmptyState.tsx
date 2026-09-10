"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@finai/ui";
import { QUICK_ACTIONS } from "../constants/quickActions";

interface EmptyStateProps {
  onSelect: (message: string) => void;
  className?: string;
}

/**
 * Landing state for the Advisor when the conversation is empty. Communicates
 * that FinAI can *analyze, plan, and act* — not merely answer questions —
 * with a compact set of action-oriented entry points.
 */
export function EmptyState({ onSelect, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-6 py-10 text-center",
        className,
      )}
    >
      {/* Hero */}
      <div className="flex flex-col items-center gap-2.5">
        <div className="bg-primary/10 flex size-14 items-center justify-center rounded-2xl">
          <Sparkles className="text-primary size-7" aria-hidden="true" />
        </div>
        <h2 className="text-foreground mt-1 text-xl font-semibold tracking-tight">AI Advisor</h2>
        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
          What can I help you with? Analyze your finances, plan your money, or ask me to take an
          action.
        </p>
      </div>

      {/* Action chips — first four quick actions */}
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

      <p className="text-muted-foreground text-xs">…or ask anything below.</p>
    </div>
  );
}

"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/EmptyState.tsx
 * @description Landing view for empty AI Advisor conversations with quick action prompt triggers.
 * @module @fin-ai/web/features/ai-advisor/components/EmptyState
 */

import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@fin-ai/ui";
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
    <div className={cn("fn-empty-state", className)}>
      {/* Hero identity */}
      <div className="fn-empty-state-hero">
        <div className="fn-empty-state-icon">
          <Sparkles className="size-7" aria-hidden="true" />
        </div>
        <h2 className="fn-empty-state-title">{UI_COPY.ADVISOR.EMPTY_STATE.TITLE}</h2>
        <p className="fn-empty-state-subtitle">{UI_COPY.ADVISOR.EMPTY_STATE.SUBTITLE}</p>
      </div>

      {/* Action starter chips — first four quick actions */}
      <div className="fn-empty-state-grid">
        {QUICK_ACTIONS.slice(0, 4).map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onSelect(action.message)}
            className="fn-empty-state-btn"
          >
            <span className="fn-empty-state-btn-content">
              <action.icon className="fn-empty-state-btn-icon" aria-hidden="true" />
              <span>{action.label}</span>
            </span>
            <ArrowRight className="fn-empty-state-btn-arrow" />
          </button>
        ))}
      </div>

      <p className="fn-empty-state-caption">{UI_COPY.ADVISOR.EMPTY_STATE.OR_ASK_BELOW}</p>
    </div>
  );
}

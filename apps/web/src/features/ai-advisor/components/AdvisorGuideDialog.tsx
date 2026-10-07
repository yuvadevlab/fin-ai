"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/AdvisorGuideDialog.tsx
 * @description Educational modal dialog explaining financial advisor capabilities and examples.
 * @module @finai/web/features/ai-advisor/components/AdvisorGuideDialog
 */

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@finai/ui";
import { Sparkles, HelpCircle } from "lucide-react";
import { UI_COPY } from "@/lib";
import { ADVISOR_GUIDE_SECTIONS } from "@/features/ai-advisor";

/** Props configuration for the {@link AdvisorGuideDialog} modal */
export interface AdvisorGuideDialogProps {
  /** Controlled open state of the dialog */
  open: boolean;
  /** Callback fired when dialog open state transitions */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal dialog presenting new and returning users with AI Advisor best practices,
 * supported quick actions, and prompt examples.
 */
export function AdvisorGuideDialog({ open, onOpenChange }: AdvisorGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex size-7 items-center justify-center rounded-lg">
              <Sparkles className="text-primary size-4" aria-hidden="true" />
            </div>
            <DialogTitle>{UI_COPY.ADVISOR.GUIDE.TITLE}</DialogTitle>
          </div>
          <DialogDescription>{UI_COPY.ADVISOR.GUIDE.DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          {ADVISOR_GUIDE_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="border-border bg-card/60 rounded-xl border p-3.5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-foreground text-sm font-semibold">{section.title}</p>
                <span className="bg-primary/10 text-primary border-primary/20 shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium">
                  {section.badge}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {section.description}
              </p>

              {/* Practical prompt examples */}
              <div className="border-border/60 mt-2.5 border-t pt-2.5">
                <p className="text-foreground/90 text-[11px] font-semibold tracking-wider uppercase">
                  {UI_COPY.ADVISOR.GUIDE.EXAMPLES_LABEL}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {section.examples.map((example, i) => (
                    <li
                      key={i}
                      className="text-foreground/80 bg-muted/40 rounded-md px-2 py-1 font-mono text-[11px]"
                    >
                      {example}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro tips section */}
              <div className="bg-primary/5 border-primary/10 mt-2.5 flex items-start gap-2 rounded-lg border p-2 text-xs">
                <HelpCircle className="text-primary mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <p className="text-foreground/80 text-[11px] leading-relaxed">
                  <span className="font-semibold">{UI_COPY.ADVISOR.GUIDE.PRO_TIP}</span>{" "}
                  {section.tips}
                </p>
              </div>
            </div>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

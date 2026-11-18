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
          <div className="fn-guide-header">
            <div className="fn-guide-header-icon">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <DialogTitle>{UI_COPY.ADVISOR.GUIDE.TITLE}</DialogTitle>
          </div>
          <DialogDescription>{UI_COPY.ADVISOR.GUIDE.DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <DialogBody className="fn-guide-body">
          {ADVISOR_GUIDE_SECTIONS.map((section) => (
            <div key={section.title} className="fn-guide-card">
              <div className="fn-guide-card-header">
                <p className="fn-guide-card-title">{section.title}</p>
                <span className="fn-guide-card-badge">{section.badge}</span>
              </div>
              <p className="fn-guide-card-desc">{section.description}</p>

              {/* Practical prompt examples */}
              <div className="fn-guide-examples">
                <p className="fn-guide-examples-label">{UI_COPY.ADVISOR.GUIDE.EXAMPLES_LABEL}</p>
                <ul className="fn-guide-examples-list">
                  {section.examples.map((example, i) => (
                    <li key={i} className="fn-guide-example-item">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro tips section */}
              <div className="fn-guide-tip">
                <HelpCircle className="fn-guide-tip-icon" aria-hidden="true" />
                <p className="fn-guide-tip-text">
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

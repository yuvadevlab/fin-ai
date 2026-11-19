"use client";

import React from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fin-ai/ui";
import { HEALTH_GUIDE } from "../constants/healthGuide";
import { UI_COPY } from "@/lib/ui-copy";

export interface HealthGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HealthGuideDialog({ open, onOpenChange }: HealthGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{UI_COPY.HEALTH.GUIDE_TITLE}</DialogTitle>
          <DialogDescription>{UI_COPY.HEALTH.GUIDE_DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <DialogBody className="fn-form-body">
          {HEALTH_GUIDE.map((item) => (
            <div key={item.label} className="fn-health-guide-item">
              <div className="fn-health-guide-header">
                <p className="fn-health-guide-label">{item.label}</p>
                <span className="fn-health-guide-target">{item.target}</span>
              </div>
              <p className="fn-health-guide-explanation">{item.explanation}</p>
              <p className="fn-health-guide-counts">
                <span className="fn-font-semibold">{UI_COPY.HEALTH.WHAT_COUNTS}</span> {item.counts}
              </p>
              <p className="fn-health-guide-improvement">
                <span className="fn-font-semibold">{UI_COPY.HEALTH.IMPROVE_IT}</span>{" "}
                {item.improvement}
              </p>
            </div>
          ))}
        </DialogBody>

        <DialogFooter className="fn-dialog-footer--start">
          <p className="fn-health-guide-footer-text">{UI_COPY.HEALTH.GUIDE_FOOTER}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

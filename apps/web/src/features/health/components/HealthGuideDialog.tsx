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
} from "@finai/ui";
import { HEALTH_GUIDE } from "../constants/healthGuide";

export interface HealthGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HealthGuideDialog({ open, onOpenChange }: HealthGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>How your financial health score works</DialogTitle>
          <DialogDescription>
            Your score is a guide to your financial resilience, not a judgement. We compare your
            habits with practical targets and point to the next improvement.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          {HEALTH_GUIDE.map((item) => (
            <div key={item.label} className="border-border bg-card rounded-lg border p-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-foreground text-sm font-bold">{item.label}</p>
                <span className="text-primary shrink-0 text-right text-xs font-semibold">
                  {item.target}
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-xs leading-5">{item.explanation}</p>
              <p className="text-muted-foreground border-border mt-2.5 border-t pt-2 text-xs leading-5">
                <span className="text-foreground font-semibold">What counts:</span> {item.counts}
              </p>
              <p className="text-foreground bg-muted/40 mt-2.5 rounded-md p-2.5 text-xs">
                <span className="font-semibold">Improve it:</span> {item.improvement}
              </p>
            </div>
          ))}
        </DialogBody>

        <DialogFooter className="justify-start">
          <p className="text-muted-foreground text-xs leading-5">
            A very low emergency fund, high debt pressure, or negative monthly cash flow can limit
            the overall score even when another metric is strong. This keeps serious risks visible.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

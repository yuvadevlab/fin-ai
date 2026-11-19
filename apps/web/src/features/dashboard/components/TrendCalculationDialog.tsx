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
import { UI_COPY } from "@/lib/ui-copy";

export type TrendGuideType = "expense" | "savings";

interface GuideItem {
  label: string;
  badge: string;
  explanation: string;
  counts: string;
  note: string;
}

const GUIDE_CONTENT: Record<
  TrendGuideType,
  {
    title: string;
    description: string;
    items: GuideItem[];
    footer: string;
  }
> = {
  expense: {
    title: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.TITLE,
    description: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.DESCRIPTION,
    items: [
      {
        label: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.CATEGORIZED_EXPENSES,
        badge: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.OUTFLOW_TRACKING,
        explanation: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.EXPENSE_EXPLANATION,
        counts: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.EXPENSE_COUNTS,
        note: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.EXPENSE_NOTE,
      },
      {
        label: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.EXCLUDED_EXPENSES,
        badge: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.TRANSFERS_INVESTMENTS,
        explanation: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.EXCLUDED_EXPLANATION,
        counts: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.EXCLUDED_COUNTS,
        note: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.EXCLUDED_NOTE,
      },
    ],
    footer: UI_COPY.DASHBOARD.TREND_GUIDE.EXPENSE.FOOTER,
  },
  savings: {
    title: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.TITLE,
    description: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.DESCRIPTION,
    items: [
      {
        label: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.NET_SAVINGS,
        badge: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.INCOME_EXPENSES,
        explanation: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.NET_EXPLANATION,
        counts: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.NET_COUNTS,
        note: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.NET_NOTE,
      },
      {
        label: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.RETAINED_SURPLUS,
        badge: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.LIQUID_ACCUMULATION,
        explanation: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.SURPLUS_EXPLANATION,
        counts: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.SURPLUS_COUNTS,
        note: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.SURPLUS_NOTE,
      },
    ],
    footer: UI_COPY.DASHBOARD.TREND_GUIDE.SAVINGS.FOOTER,
  },
};

export interface TrendCalculationDialogProps {
  type: TrendGuideType | null;
  onOpenChange: (open: boolean) => void;
}

export function TrendCalculationDialog({ type, onOpenChange }: TrendCalculationDialogProps) {
  if (!type) return null;

  const content = GUIDE_CONTENT[type];

  return (
    <Dialog open={Boolean(type)} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <DialogBody className="fn-form-body">
          {content.items.map((item) => (
            <div key={item.label} className="fn-health-guide-item">
              <div className="fn-health-guide-header">
                <p className="fn-health-guide-label">{item.label}</p>
                <span className="fn-health-guide-target">{item.badge}</span>
              </div>
              <p className="fn-health-guide-explanation">{item.explanation}</p>
              <p className="fn-health-guide-counts">
                <span className="fn-font-semibold">{UI_COPY.HEALTH.WHAT_COUNTS}</span> {item.counts}
              </p>
              <p className="fn-health-guide-improvement">
                <span className="fn-font-semibold">{UI_COPY.HEALTH.CALCULATION_NOTE}</span>{" "}
                {item.note}
              </p>
            </div>
          ))}
        </DialogBody>

        <DialogFooter className="fn-dialog-footer--start">
          <p className="fn-health-guide-footer-text">{content.footer}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

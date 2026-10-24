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

        <DialogBody className="space-y-3">
          {content.items.map((item) => (
            <div key={item.label} className="border-border bg-card rounded-lg border p-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-foreground text-sm font-bold">{item.label}</p>
                <span className="text-primary shrink-0 text-right text-xs font-semibold">
                  {item.badge}
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-xs leading-5">{item.explanation}</p>
              <p className="text-muted-foreground border-border mt-2.5 border-t pt-2 text-xs leading-5">
                <span className="text-foreground font-semibold">{UI_COPY.HEALTH.WHAT_COUNTS}</span>{" "}
                {item.counts}
              </p>
              <p className="text-foreground bg-muted/40 mt-2.5 rounded-md p-2.5 text-xs">
                <span className="font-semibold">{UI_COPY.HEALTH.CALCULATION_NOTE}</span> {item.note}
              </p>
            </div>
          ))}
        </DialogBody>

        <DialogFooter className="justify-start">
          <p className="text-muted-foreground text-xs leading-5">{content.footer}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

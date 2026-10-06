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
    title: "How Expense Trend is calculated",
    description:
      "Understand how your monthly spending is aggregated and what counts toward your living expenses.",
    items: [
      {
        label: "Categorized Monthly Expenses",
        badge: "Outflow Tracking",
        explanation:
          "Sums all debits categorized as EXPENSE occurring within each calendar month based on transaction dates.",
        counts:
          "Living costs, rent, utilities, food, groceries, shopping, EMI payments, and healthcare.",
        note: "Amounts are normalized using absolute values so negative debits and positive charges are aggregated accurately without double-counting.",
      },
      {
        label: "Excluded from Expenses",
        badge: "Transfers & Investments",
        explanation:
          "Internal movements between your own accounts and allocations into wealth assets do not count as expenses.",
        counts:
          "Account-to-account transfers, credit card settlements, mutual funds, stocks, fixed deposits, and gold investments.",
        note: "This protects your cost-of-living metrics from being artificially inflated by wealth-building and fund transfers.",
      },
    ],
    footer:
      "Expense metrics represent pure consumption and obligations, giving you an accurate picture of your true monthly burn rate.",
  },
  savings: {
    title: "How Savings Trend is calculated",
    description:
      "Understand how your monthly net savings are computed from cash flow inflows and outflows.",
    items: [
      {
        label: "Net Savings Formula",
        badge: "Income − Expenses",
        explanation:
          "Calculated per calendar month by subtracting total monthly living expenses from total verified income.",
        counts:
          "Salary, business revenue, freelance payouts, dividends, minus all categorized monthly expenses.",
        note: "Values are clamped at zero (Math.max(0, net)) for trend visualization so drawdown months do not display misleading negative bars.",
      },
      {
        label: "Retained Surplus",
        badge: "Liquid Accumulation",
        explanation:
          "The unspent surplus retained in your accounts each month after meeting living requirements.",
        counts:
          "Money available for emergency fund reserves, discretionary cushions, or deployment into long-term investments.",
        note: "Consistent positive savings indicate a healthy savings rate and provide the fuel for portfolio compounding.",
      },
    ],
    footer:
      "A healthy savings trend sustains emergency buffers and powers ongoing goal contributions across market cycles.",
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
                <span className="text-foreground font-semibold">What counts:</span> {item.counts}
              </p>
              <p className="text-foreground bg-muted/40 mt-2.5 rounded-md p-2.5 text-xs">
                <span className="font-semibold">Calculation note:</span> {item.note}
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

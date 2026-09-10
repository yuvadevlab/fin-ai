import type { Meta, StoryObj } from "@storybook/react";
import { ProgressCard } from "./ProgressCard";
import { StatusBadge } from "./StatusBadge";

/**
 * `ProgressCard` shows a named financial metric (e.g. a budget category
 * or a savings goal) with its current value, target, and a progress bar.
 *
 * It composes `ContentCard` + Radix `Progress` and supports:
 * - Optional status badge slot (`statusBadge`)
 * - Footer left/right slots for metadata (dates, percentages)
 * - Privacy masking via `masked` prop
 */
const meta: Meta<typeof ProgressCard> = {
  title: "Components / ProgressCard",
  component: ProgressCard,
  tags: ["autodocs"],
  args: {
    title: "Groceries",
    value: 6500,
    target: 10000,
    unit: "₹",
    percentage: 65,
  },
  argTypes: {
    masked: { control: "boolean" },
    percentage: { control: { type: "range", min: 0, max: 150 } },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressCard>;

/** On-track budget — progress below 80%. */
export const OnTrack: Story = {
  args: {
    statusBadge: <StatusBadge status="ON_TRACK" />,
    footerLeft: "15 days left",
    footerRight: "65%",
  },
};

/** Near-limit — progress approaching 100%. */
export const NearLimit: Story = {
  args: {
    value: 8800,
    percentage: 88,
    statusBadge: <StatusBadge status="NEAR_LIMIT" />,
    footerLeft: "5 days left",
    footerRight: "88% used",
  },
};

/** Over-budget — progress exceeds 100% (clamped to bar width). */
export const OverBudget: Story = {
  args: {
    value: 13500,
    percentage: 135,
    statusBadge: <StatusBadge status="OVER" />,
    footerLeft: "₹3,500 over",
    footerRight: "135%",
  },
};

/** Privacy masked — values replaced with ••••••. */
export const Masked: Story = {
  args: {
    masked: true,
    statusBadge: <StatusBadge status="ON_TRACK" />,
    footerLeft: "15 days left",
  },
};

/** With subtitle line. */
export const WithSubtitle: Story = {
  args: {
    subtitle: "Monthly budget · Sep 2026",
    footerLeft: "₹3,500 remaining",
    footerRight: "65%",
  },
};

/** Zero progress — empty bar. */
export const ZeroProgress: Story = {
  args: { value: 0, percentage: 0, footerLeft: "Not started" },
};

/** Long title — verifies text truncation. */
export const LongTitle: Story = {
  args: {
    title: "International Business Travel & Entertainment Expenses",
    footerLeft: "20 days left",
    footerRight: "65%",
  },
};

/** No footer — minimal layout. */
export const NoFooter: Story = {};

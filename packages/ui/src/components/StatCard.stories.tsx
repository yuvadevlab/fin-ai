import type { Meta, StoryObj } from "@storybook/react";
import { TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";

/**
 * `StatCard` displays a single KPI metric: a label, a value, an optional
 * trend badge (up/down/flat), a hint, and optional child content.
 *
 * Used across the dashboard for Net Worth, Monthly Cash Flow, Savings Rate, etc.
 */
const meta: Meta<typeof StatCard> = {
  title: "Components / StatCard",
  component: StatCard,
  tags: ["autodocs"],
  args: {
    label: "Net Worth",
    value: "₹12,45,000",
  },
  argTypes: {
    trend: {
      control: "object",
      description: "Optional trend indicator with value and kind ('up' | 'down' | 'flat')",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

/** Minimal — label and value only. */
export const Minimal: Story = {};

/** With an upward trend badge and hint text. */
export const TrendUp: Story = {
  args: {
    trend: { kind: "up", value: "+8.3%" },
    hint: "vs last month",
  },
};

/** Downward trend — destructive red badge. */
export const TrendDown: Story = {
  args: {
    label: "Monthly Spend",
    value: "₹42,000",
    trend: { kind: "down", value: "-12%" },
    hint: "vs last month",
  },
};

/** Flat trend — muted neutral badge. */
export const TrendFlat: Story = {
  args: {
    trend: { kind: "flat", value: "0%" },
    hint: "No change this month",
  },
};

/** With custom children rendered below the hint. */
export const WithChildren: Story = {
  args: {
    label: "Savings Rate",
    value: "24%",
    trend: { kind: "up", value: "+3%" },
    hint: "of income",
    children: (
      <div className="text-primary mt-2 flex items-center gap-1 text-xs">
        <TrendingUp className="size-3" />
        On track for your goal
      </div>
    ),
  },
};

/** Long value string — verifies layout doesn't break. */
export const LongValue: Story = {
  args: {
    label: "Total Portfolio Value",
    value: "₹1,23,45,678.90",
    trend: { kind: "up", value: "+2.1%" },
  },
};

/** Long label — ensures uppercase label wraps gracefully. */
export const LongLabel: Story = {
  args: {
    label: "Outstanding Loan Balance Including Interest",
    value: "₹8,50,000",
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { TrendLine } from "./TrendLineChart";

const sampleTrendData = [
  { month: "Jan", value: 1200000 },
  { month: "Feb", value: 1240000 },
  { month: "Mar", value: 1210000 },
  { month: "Apr", value: 1290000 },
  { month: "May", value: 1350000 },
  { month: "Jun", value: 1420000 },
];

/**
 * `TrendLine` displays historical progression over time, such as Net Worth or Investment Portfolio growth.
 */
const meta: Meta<typeof TrendLine> = {
  title: "Charts / TrendLine",
  component: TrendLine,
  tags: ["autodocs"],
  args: {
    data: sampleTrendData,
  },
};

export default meta;
type Story = StoryObj<typeof TrendLine>;

/** Net worth upward progression. */
export const Default: Story = {};

/** Short 3-month trendline. */
export const ShortHorizon: Story = {
  args: {
    data: [
      { month: "Q1", value: 50000 },
      { month: "Q2", value: 75000 },
      { month: "Q3", value: 92000 },
    ],
  },
};

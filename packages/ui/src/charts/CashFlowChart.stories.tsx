import type { Meta, StoryObj } from "@storybook/react";
import { CashFlowChart } from "./CashFlowChart";

const sampleCashFlowData = [
  { month: "Jan", income: 110000, expense: 78000 },
  { month: "Feb", income: 115000, expense: 82000 },
  { month: "Mar", income: 120000, expense: 65000 },
  { month: "Apr", income: 110000, expense: 91000 },
  { month: "May", income: 125000, expense: 72000 },
  { month: "Jun", income: 140000, expense: 85000 },
];

/**
 * `CashFlowChart` visualises monthly income versus expenses using dual gradient area charts.
 */
const meta: Meta<typeof CashFlowChart> = {
  title: "Charts / CashFlowChart",
  component: CashFlowChart,
  tags: ["autodocs"],
  args: {
    data: sampleCashFlowData,
  },
};

export default meta;
type Story = StoryObj<typeof CashFlowChart>;

/** Six-month cash flow overview. */
export const Default: Story = {};

/** Volatile cash flow with higher expenses in certain months. */
export const VolatileExpenses: Story = {
  args: {
    data: [
      { month: "Jul", income: 95000, expense: 105000 },
      { month: "Aug", income: 110000, expense: 85000 },
      { month: "Sep", income: 130000, expense: 120000 },
      { month: "Oct", income: 125000, expense: 70000 },
    ],
  },
};

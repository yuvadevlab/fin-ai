import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { FilterChips } from "./FilterChips";

/**
 * `FilterChips` provides a horizontal list of pill buttons for single-selection filtering.
 */
const meta: Meta<typeof FilterChips> = {
  title: "Components / FilterChips",
  component: FilterChips,
  tags: ["autodocs"],
  args: {
    options: ["All", "Income", "Expense", "Transfer", "Investment"],
    selected: "All",
    onChange: fn(),
  },
  argTypes: {
    selected: {
      control: "select",
      options: ["All", "Income", "Expense", "Transfer", "Investment"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterChips>;

/** Standard filter chips with "All" active. */
export const Default: Story = {};

/** With "Expense" selected. */
export const ExpenseSelected: Story = {
  args: {
    selected: "Expense",
  },
};

/** Timeframe filter options. */
export const TimePeriods: Story = {
  args: {
    options: ["1M", "3M", "6M", "1Y", "ALL"],
    selected: "3M",
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { TransactionTypeBadge } from "./TransactionTypeBadge";

/**
 * `TransactionTypeBadge` renders a coloured pill for the five
 * `TransactionType` values from `@finai/shared-types`.
 *
 * | Type | Colour |
 * |---|---|
 * | INCOME | Emerald (primary) |
 * | EXPENSE | Red (destructive) |
 * | TRANSFER | Amber |
 * | INVESTMENT | Blue |
 * | GOAL | Purple |
 */
const meta: Meta<typeof TransactionTypeBadge> = {
  title: "Components / TransactionTypeBadge",
  component: TransactionTypeBadge,
  tags: ["autodocs"],
  args: { type: "INCOME" },
  argTypes: {
    type: {
      control: "select",
      options: ["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT", "GOAL"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TransactionTypeBadge>;

export const Income: Story = {};

export const Expense: Story = {
  args: { type: "EXPENSE" },
};

export const Transfer: Story = {
  args: { type: "TRANSFER" },
};

export const Investment: Story = {
  args: { type: "INVESTMENT" },
};

export const Goal: Story = {
  args: { type: "GOAL" },
};

/** All types side-by-side for design review. */
export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <TransactionTypeBadge type="INCOME" />
      <TransactionTypeBadge type="EXPENSE" />
      <TransactionTypeBadge type="TRANSFER" />
      <TransactionTypeBadge type="INVESTMENT" />
      <TransactionTypeBadge type="GOAL" />
    </div>
  ),
};

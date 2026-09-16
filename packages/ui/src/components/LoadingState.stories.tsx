import type { Meta, StoryObj } from "@storybook/react";
import { LoadingState } from "./LoadingState";

/**
 * `LoadingState` provides skeleton loading placeholders matching FinAI card and row dimensions.
 */
const meta: Meta<typeof LoadingState> = {
  title: "Components / LoadingState",
  component: LoadingState,
  tags: ["autodocs"],
  args: {
    rows: 3,
  },
  argTypes: {
    rows: {
      control: { type: "number", min: 1, max: 10 },
      description: "Number of row skeletons to render",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

/** Standard 3-row skeleton loader. */
export const Default: Story = {};

/** Compact single-item skeleton loader. */
export const SingleRow: Story = {
  args: {
    rows: 1,
  },
};

/** Many rows for data-heavy table views. */
export const ManyRows: Story = {
  args: {
    rows: 6,
  },
};

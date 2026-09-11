import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { EmptyState } from "./EmptyState";

/**
 * `EmptyState` is the welcome landing surface when a user opens the FinAI Advisor
 * with an empty conversation, presenting suggested queries and actions.
 */
const meta: Meta<typeof EmptyState> = {
  title: "AI Advisor / EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/** Default welcome hero state. */
export const Default: Story = {};

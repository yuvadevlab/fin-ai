import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { QuickActions } from "./QuickActions";

/**
 * `QuickActions` provides quick entry points to common AI financial advisory prompts,
 * supporting both horizontal pill chips and two-column card grids.
 */
const meta: Meta<typeof QuickActions> = {
  title: "AI Advisor / QuickActions",
  component: QuickActions,
  tags: ["autodocs"],
  args: {
    onSelect: fn(),
    disabled: false,
    variant: "grid",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["grid", "chips"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof QuickActions>;

/** Two-column grid used in the right-side Context panel. */
export const GridVariant: Story = {};

/** Horizontal chip row used above the message composer. */
export const ChipsVariant: Story = {
  args: {
    variant: "chips",
  },
};

/** Disabled state during streaming generation. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

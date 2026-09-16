import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * `ConfirmDialog` presents an accessible modal alert dialog for confirming destructive or critical actions.
 */
const meta: Meta<typeof ConfirmDialog> = {
  title: "Components / ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    title: "Delete Transaction",
    description: "Are you sure you want to delete this transaction? This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel",
    destructive: true,
    onConfirm: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    destructive: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    confirmText: { control: "text" },
    cancelText: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

/** Destructive confirmation (e.g. deletion). */
export const Destructive: Story = {};

/** Non-destructive confirmation (e.g. archiving or resetting). */
export const NonDestructive: Story = {
  args: {
    title: "Reset Budget Period",
    description: "Resetting will roll over remaining balances into next month's envelope.",
    confirmText: "Proceed",
    destructive: false,
  },
};

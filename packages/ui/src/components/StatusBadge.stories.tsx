import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./StatusBadge";

/**
 * `StatusBadge` renders a coloured pill for budget/goal status:
 * - `ON_TRACK` → emerald (primary)
 * - `NEAR_LIMIT` → amber warning
 * - `OVER` → destructive red with alert icon
 *
 * Custom label text can override each state's default text.
 */
const meta: Meta<typeof StatusBadge> = {
  title: "Components / StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  args: { status: "ON_TRACK" },
  argTypes: {
    status: {
      control: "select",
      options: ["ON_TRACK", "NEAR_LIMIT", "OVER"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

/** On track — green primary. */
export const OnTrack: Story = {};

/** Near limit — amber warning. */
export const NearLimit: Story = {
  args: { status: "NEAR_LIMIT" },
};

/** Over limit — destructive with icon. */
export const Over: Story = {
  args: { status: "OVER" },
};

/** Custom label text for each status. */
export const CustomLabels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="ON_TRACK" trackText="Within budget" />
      <StatusBadge status="NEAR_LIMIT" warnText="Approaching cap" />
      <StatusBadge status="OVER" overText="Exceeded" />
    </div>
  ),
};

/** All statuses side by side. */
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="ON_TRACK" />
      <StatusBadge status="NEAR_LIMIT" />
      <StatusBadge status="OVER" />
    </div>
  ),
};

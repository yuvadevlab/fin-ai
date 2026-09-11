import type { Meta, StoryObj } from "@storybook/react";
import { ActivityStep } from "./ActivityStep";

/**
 * `ActivityStep` renders a step item within an autonomous task or workflow timeline,
 * indicating states (pending, running, success, error) with accessible labels and icons.
 */
const meta: Meta<typeof ActivityStep> = {
  title: "Components / ActivityStep",
  component: ActivityStep,
  tags: ["autodocs"],
  args: {
    step: {
      id: "step-1",
      status: "running",
      label: "Categorizing imported bank transactions",
      detail: "Running AI zero-shot classification model",
      duration: "1.2s",
    },
    expanded: true,
    isCurrent: true,
  },
  argTypes: {
    expanded: { control: "boolean" },
    isCurrent: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityStep>;

/** Active running step with pulse/spinner. */
export const Running: Story = {};

/** Successfully completed step. */
export const Success: Story = {
  args: {
    step: {
      id: "step-2",
      status: "success",
      label: "Fetched monthly statement from HDFC",
      detail: "148 transactions parsed successfully",
      duration: "0.8s",
    },
    isCurrent: false,
  },
};

/** Step that failed with error state. */
export const ErrorState: Story = {
  args: {
    step: {
      id: "step-3",
      status: "error",
      label: "Failed to connect to Brokerage API",
      detail: "Invalid API secret or session token expired",
      duration: "4.5s",
    },
    isCurrent: false,
  },
};

/** Pending upcoming step. */
export const Pending: Story = {
  args: {
    step: {
      id: "step-4",
      status: "pending",
      label: "Recalculating net worth and asset allocation",
    },
    isCurrent: false,
    expanded: false,
  },
};

/** Sequence showing multiple steps in a process timeline. */
export const TimelineSequence: Story = {
  render: () => (
    <ul className="w-full max-w-md space-y-1">
      <ActivityStep
        step={{
          id: "1",
          status: "success",
          label: "Connected to ICICI Bank account",
          detail: "Sync complete",
          duration: "1.1s",
        }}
        expanded
      />
      <ActivityStep
        step={{
          id: "2",
          status: "running",
          label: "Analyzing recurring bills and subscriptions",
          detail: "Examining 6 months of historical transactions",
        }}
        expanded
        isCurrent
      />
      <ActivityStep
        step={{
          id: "3",
          status: "pending",
          label: "Generating monthly cash flow forecast",
        }}
      />
    </ul>
  ),
};

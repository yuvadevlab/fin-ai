import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { GoalForm } from "./GoalForm";

/**
 * `GoalForm` is the feature form used to create or edit savings and investment goals,
 * featuring currency inputs, goal type selection, and deadline picking.
 */
const meta: Meta<typeof GoalForm> = {
  title: "Goals / GoalForm",
  component: GoalForm,
  tags: ["autodocs"],
  args: {
    values: {
      name: "Emergency Fund",
      type: "EMERGENCY_FUND",
      targetAmount: "300000",
      currentAmount: "125000",
      deadline: "2025-12-31",
    },
    errors: {},
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof GoalForm>;

/** Prefilled goal editing state. */
export const EditGoal: Story = {};

/** Empty goal creation state. */
export const NewGoal: Story = {
  args: {
    values: {
      name: "",
      type: "",
      targetAmount: "",
      currentAmount: "",
      deadline: "",
    },
    errors: {},
  },
};

/** Form with validation errors highlighted. */
export const WithValidationErrors: Story = {
  args: {
    values: {
      name: "",
      type: "",
      targetAmount: "-500",
      currentAmount: "1000",
      deadline: "",
    },
    errors: {
      name: "Goal name is required",
      type: "Please select a goal type",
      targetAmount: "Target amount must be a positive number",
      deadline: "Target deadline is required",
    },
  },
};

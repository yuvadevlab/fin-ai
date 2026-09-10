import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Input } from "./input";

/**
 * `Input` is the base text input primitive used throughout all FinAI forms.
 * It applies FinAI token-based styling and exposes the full native
 * `HTMLInputElement` attribute surface.
 *
 * Always pair with a `<Label>` for accessibility — standalone `placeholder`
 * is not sufficient for screen readers.
 */
const meta: Meta<typeof Input> = {
  title: "Primitives / Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter a value…",
    onChange: fn(),
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "url"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

/** Default text input. */
export const Default: Story = {};

/** Email input — triggers email keyboard on mobile. */
export const Email: Story = {
  args: { type: "email", placeholder: "you@example.com" },
};

/** Password input — masks characters. */
export const Password: Story = {
  args: { type: "password", placeholder: "Your password" },
};

/** Numeric input — used for amounts and quantities. */
export const Number: Story = {
  args: { type: "number", placeholder: "0.00", min: "0", step: "0.01" },
};

/** Pre-filled value. */
export const WithValue: Story = {
  args: { defaultValue: "Emergency Fund" },
};

/** Disabled state. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read-only value" },
};

/** Error state — red ring applied via className; pair with error message text. */
export const WithError: Story = {
  args: {
    className: "border-destructive focus-visible:ring-destructive/30",
    placeholder: "Goal name",
    defaultValue: "",
  },
};

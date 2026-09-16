import type { Meta, StoryObj } from "@storybook/react";
import { MaskedValue } from "./MaskedValue";

/**
 * `MaskedValue` renders sensitive financial numbers with an optional mask placeholder,
 * supporting accessible privacy modes across the FinAI suite.
 */
const meta: Meta<typeof MaskedValue> = {
  title: "Components / MaskedValue",
  component: MaskedValue,
  tags: ["autodocs"],
  args: {
    value: "₹1,24,500.00",
    masked: false,
    maskPlaceholder: "••••••",
  },
  argTypes: {
    masked: { control: "boolean" },
    maskPlaceholder: { control: "text" },
    prefix: { control: "text" },
    suffix: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MaskedValue>;

/** Unmasked standard value. */
export const Unmasked: Story = {};

/** Masked value hiding sensitive amount. */
export const Masked: Story = {
  args: {
    masked: true,
  },
};

/** Masked with custom placeholder asterisks. */
export const CustomPlaceholder: Story = {
  args: {
    masked: true,
    maskPlaceholder: "██████",
  },
};

/** With prefix and suffix. */
export const WithPrefixAndSuffix: Story = {
  args: {
    prefix: "Balance: ",
    suffix: " (INR)",
    value: "₹50,000",
  },
};

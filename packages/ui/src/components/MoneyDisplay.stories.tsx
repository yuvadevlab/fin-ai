import type { Meta, StoryObj } from "@storybook/react";
import { MoneyDisplay } from "./MoneyDisplay";

/**
 * `MoneyDisplay` renders a currency value with locale formatting,
 * semantic colour (positive / negative), and an optional privacy mask.
 *
 * It uses `en-IN` locale by default (Indian Rupee ₹) but supports any
 * ISO 4217 currency via the `currency` prop.
 *
 * **Privacy note**: When `masked={true}`, the real value is visually
 * replaced with `••••••` while the screen-reader still gets
 * "Amount hidden for privacy" via an `sr-only` span.
 */
const meta: Meta<typeof MoneyDisplay> = {
  title: "Components / MoneyDisplay",
  component: MoneyDisplay,
  tags: ["autodocs"],
  args: { value: 10000 },
  argTypes: {
    currency: { control: "text" },
    masked: { control: "boolean" },
    showSign: { control: "boolean" },
    maskPlaceholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MoneyDisplay>;

/** Default positive INR value. */
export const Default: Story = {};

/** Negative value — rendered in destructive red. */
export const Negative: Story = {
  args: { value: -4250 },
};

/** Positive with explicit `+` sign prefix (used in gain/loss columns). */
export const PositiveWithSign: Story = {
  args: { value: 3000, showSign: true },
};

/** Negative with explicit sign — still shows `-`. */
export const NegativeWithSign: Story = {
  args: { value: -1500, showSign: true },
};

/** Masked — hides the value for privacy mode. */
export const Masked: Story = {
  args: { masked: true },
};

/** Masked with custom placeholder character string. */
export const MaskedCustomPlaceholder: Story = {
  args: { masked: true, maskPlaceholder: "★★★★" },
};

/** Zero value — renders as ₹0. */
export const Zero: Story = {
  args: { value: 0 },
};

/** Very large value with crore-level formatting. */
export const LargeValue: Story = {
  args: { value: 12345678.9 },
};

/** USD currency. */
export const USD: Story = {
  args: { value: 9999.99, currency: "USD" },
};

/** Value with decimal paise — shows 2 decimal places. */
export const WithDecimals: Story = {
  args: { value: 1234.56 },
};

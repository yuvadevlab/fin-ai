import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { SearchBar } from "./SearchBar";

/**
 * `SearchBar` renders a search input with an integrated search icon and standard styling.
 */
const meta: Meta<typeof SearchBar> = {
  title: "Components / SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  args: {
    placeholder: "Search transactions, categories, merchants...",
    onChange: fn(),
  },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

/** Standard search bar with placeholder. */
export const Default: Story = {};

/** With prefilled query value. */
export const WithValue: Story = {
  args: {
    defaultValue: "Swiggy",
  },
};

/** Disabled state. */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Search is currently unavailable",
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

/**
 * `Badge` renders a small inline label with semantic colour variants.
 * Used for status indicators, counts, and category tags throughout FinAI.
 */
const meta: Meta<typeof Badge> = {
  title: "Primitives / Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Badge" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/** Default badge — primary brand colour. */
export const Default: Story = {};

/** Secondary variant for de-emphasised labels. */
export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

/** Destructive — alerts and error states. */
export const Destructive: Story = {
  args: { variant: "destructive", children: "Error" },
};

/** Outline — border only, no fill. */
export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

/** All variants side-by-side for quick visual comparison. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

/** Badge as a numeric count — common in notification bubbles. */
export const NumericCount: Story = {
  args: { children: "12" },
};

/** Long label — verifies text wrapping does not break layout. */
export const LongLabel: Story = {
  args: { children: "Very long badge label text" },
};

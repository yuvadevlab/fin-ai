import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "./button";

/**
 * The `Button` component is the primary call-to-action element across FinAI.
 * It wraps Radix `Slot` for polymorphism and uses `class-variance-authority`
 * for variant/size composition.
 *
 * **Variants**: `default` · `destructive` · `outline` · `secondary` · `ghost` · `link`
 *
 * **Sizes**: `default` · `sm` · `lg` · `icon`
 */
const meta: Meta<typeof Button> = {
  title: "Primitives / Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    onClick: fn(),
    children: "Button",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/** The default primary action button. */
export const Default: Story = {};

/** Use for dangerous or irreversible actions (delete, revoke). */
export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete account" },
};

/** Bordered button for secondary emphasis without solid fill. */
export const Outline: Story = {
  args: { variant: "outline", children: "Export data" },
};

/** Subtle, muted variant for tertiary actions. */
export const Secondary: Story = {
  args: { variant: "secondary", children: "View details" },
};

/** Invisible background; used for inline text actions. */
export const Ghost: Story = {
  args: { variant: "ghost", children: "Cancel" },
};

/** Styled as a hyperlink; navigational text actions. */
export const Link: Story = {
  args: { variant: "link", children: "Learn more" },
};

/** Compact button for toolbars and filter rows. */
export const Small: Story = {
  args: { size: "sm", children: "Add transaction" },
};

/** Large button for prominent hero CTAs. */
export const Large: Story = {
  args: { size: "lg", children: "Get started" },
};

/** Square icon-only button. Must have an `aria-label` when used without text. */
export const IconOnly: Story = {
  args: {
    size: "icon",
    "aria-label": "Add new item",
    children: <Plus className="size-4" />,
  },
};

/** Disabled state — pointer-events none, reduced opacity. */
export const Disabled: Story = {
  args: { disabled: true, children: "Save changes" },
};

/** Loading simulation — show a spinner icon with text. */
export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Download className="size-4 animate-bounce" />
        Saving…
      </>
    ),
  },
};

/** Destructive with icon — common pattern for delete row actions. */
export const DestructiveWithIcon: Story = {
  args: {
    variant: "destructive",
    size: "sm",
    children: (
      <>
        <Trash2 className="size-3.5" />
        Delete
      </>
    ),
  },
};

/** All variants side by side for a quick visual overview. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

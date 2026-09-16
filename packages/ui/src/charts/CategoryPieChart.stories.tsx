import type { Meta, StoryObj } from "@storybook/react";
import { CategoryPie } from "./CategoryPieChart";

const sampleCategoryData = [
  { name: "Housing", value: 35000 },
  { name: "Food & Dining", value: 18000 },
  { name: "Transportation", value: 9500 },
  { name: "Utilities", value: 6200 },
  { name: "Entertainment", value: 8400 },
  { name: "Healthcare", value: 4500 },
];

/**
 * `CategoryPie` renders a donut chart for expense breakdown across budget categories.
 */
const meta: Meta<typeof CategoryPie> = {
  title: "Charts / CategoryPie",
  component: CategoryPie,
  tags: ["autodocs"],
  args: {
    data: sampleCategoryData,
  },
};

export default meta;
type Story = StoryObj<typeof CategoryPie>;

/** Standard breakdown of household spending. */
export const Default: Story = {};

/** Top 3 concentrated categories. */
export const Concentrated: Story = {
  args: {
    data: [
      { name: "Rent", value: 50000 },
      { name: "SIP / Investments", value: 40000 },
      { name: "Living Expenses", value: 20000 },
    ],
  },
};

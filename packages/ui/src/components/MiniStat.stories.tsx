import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUpRight, DollarSign, PiggyBank, Wallet } from "lucide-react";
import { MiniStat } from "./MiniStat";

/**
 * `MiniStat` provides a compact KPI summary tile with a label, value,
 * optional sub-label, and optional icon.
 */
const meta: Meta<typeof MiniStat> = {
  title: "Components / MiniStat",
  component: MiniStat,
  tags: ["autodocs"],
  args: {
    label: "Total Balance",
    value: "₹4,25,000",
    sub: "+12% this month",
  },
};

export default meta;
type Story = StoryObj<typeof MiniStat>;

/** Standard display with icon and positive sub-label. */
export const Default: Story = {
  args: {
    icon: <Wallet className="fn-icon-lg" />,
  },
};

/** Minimal — label and value without icon or sub text. */
export const Minimal: Story = {
  args: {
    label: "Emergency Fund",
    value: "₹1,50,000",
    sub: undefined,
    icon: undefined,
  },
};

/** With PiggyBank icon for savings goal tracking. */
export const SavingsGoal: Story = {
  args: {
    label: "Retirement Pot",
    value: "₹28,50,000",
    sub: "Target: ₹50,00,000",
    icon: <PiggyBank style={{ color: "var(--primary)", width: "1.25rem", height: "1.25rem" }} />,
  },
};

/** Grid showcase demonstrating multiple mini stats side-by-side. */
export const GridShowcase: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
      }}
    >
      <MiniStat
        label="Income"
        value="₹1,20,000"
        sub="This month"
        icon={
          <ArrowUpRight style={{ color: "var(--primary)", width: "1.25rem", height: "1.25rem" }} />
        }
      />
      <MiniStat
        label="Investments"
        value="₹8,40,000"
        sub="18 Holdings"
        icon={<DollarSign style={{ color: "#6366f1", width: "1.25rem", height: "1.25rem" }} />}
      />
      <MiniStat
        label="Liquid Cash"
        value="₹65,000"
        sub="In 2 savings accounts"
        icon={<Wallet style={{ color: "#f59e0b", width: "1.25rem", height: "1.25rem" }} />}
      />
    </div>
  ),
};

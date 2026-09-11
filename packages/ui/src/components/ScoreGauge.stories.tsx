import type { Meta, StoryObj } from "@storybook/react";
import { ScoreGauge } from "./ScoreGauge";

/**
 * `ScoreGauge` renders an SVG arc-based circular progress indicator
 * for financial health scores (0–100).
 *
 * **Colour thresholds**:
 * - ≥ 80 → `text-primary` (emerald — good)
 * - 60–79 → `text-amber-500` (amber — fair)
 * - < 60 → `text-destructive` (red — poor)
 *
 * **Accessibility**: Uses `role="progressbar"` with `aria-valuenow`,
 * `aria-valuemin`, `aria-valuemax`, and `aria-label`. The inner SVG
 * is `aria-hidden`.
 */
const meta: Meta<typeof ScoreGauge> = {
  title: "Components / ScoreGauge",
  component: ScoreGauge,
  tags: ["autodocs"],
  args: { score: 75 },
  argTypes: {
    score: { control: { type: "range", min: 0, max: 100 } },
    maxScore: { control: "number" },
    size: { control: "number" },
    strokeWidth: { control: "number" },
    showRating: { control: "boolean" },
    label: { control: "text" },
    rating: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ScoreGauge>;

/** Default — 75/100, no rating label. */
export const Default: Story = {};

/** Excellent score (≥ 80) — primary emerald colour. */
export const Excellent: Story = {
  args: { score: 92, showRating: true, rating: "Excellent" },
};

/** Good score (60–79) — amber colour. */
export const Good: Story = {
  args: { score: 68, showRating: true, rating: "Good" },
};

/** Poor score (< 60) — destructive red. */
export const Poor: Story = {
  args: { score: 38, showRating: true, rating: "Poor" },
};

/** Critical — score of 0. */
export const Zero: Story = {
  args: { score: 0, showRating: true, rating: "Critical" },
};

/** Perfect — score of 100. */
export const Perfect: Story = {
  args: { score: 100, showRating: true, rating: "Perfect" },
};

/** Clamped — score above maxScore is clamped to maxScore. */
export const OverMaxClamped: Story = {
  args: { score: 150, maxScore: 100, showRating: true, rating: "Clamped" },
};

/** Larger size for hero display on health dashboard. */
export const LargeSize: Story = {
  args: { score: 80, size: 220, strokeWidth: 14, showRating: true, rating: "Great" },
};

/** Compact size for embedding inside cards. */
export const SmallSize: Story = {
  args: { score: 70, size: 100, strokeWidth: 8 },
};

/** Custom label text. */
export const CustomLabel: Story = {
  args: { score: 82, label: "health pts" },
};

/** Custom maxScore — e.g. a 0–850 credit score scaled to 750. */
export const CustomMaxScore: Story = {
  args: { score: 750, maxScore: 850, label: "out of 850" },
};

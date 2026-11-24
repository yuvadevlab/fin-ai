import React from "react";

/** Emotional evaluation polarity for monthly trend metrics */
export type TrendPolarity = "positive-growth" | "positive-reduction";

/** Data point schema for reusable emotional trend line charts */
export interface TrendDataPoint {
  label: string;
  value: number;
}

/**
 * Determines whether a given data point reflects positive or negative emotional sentiment.
 */
export function getPointSentiment(
  index: number,
  data: TrendDataPoint[],
  polarity: TrendPolarity,
): "positive" | "negative" {
  if (index <= 0) return "positive";
  const prev = data[index - 1]?.value ?? 0;
  const curr = data[index]?.value ?? 0;
  return polarity === "positive-reduction"
    ? curr <= prev
      ? "positive"
      : "negative"
    : curr >= prev
      ? "positive"
      : "negative";
}

/**
 * Computes semantic CSS variable color for milestone and active dots based on sentiment.
 */
export function getPointColor(
  index: number,
  data: TrendDataPoint[],
  polarity: TrendPolarity,
): string {
  return getPointSentiment(index, data, polarity) === "positive"
    ? "var(--primary)"
    : "var(--destructive)";
}

/**
 * Generates paired gradient stops along the SVG linear gradient progression.
 */
export function buildGradientStops(
  data: TrendDataPoint[],
  polarity: TrendPolarity,
): React.ReactElement[] | null {
  if (data.length <= 1) return null;
  const total = data.length - 1;
  const stops: React.ReactElement[] = [];

  for (let i = 1; i < data.length; i++) {
    const color = getPointColor(i, data, polarity);
    const startPct = `${((i - 1) / total) * 100}%`;
    const endPct = `${(i / total) * 100}%`;

    stops.push(
      <stop key={`stop-start-${i}`} offset={startPct} stopColor={color} />,
      <stop key={`stop-end-${i}`} offset={endPct} stopColor={color} />,
    );
  }
  return stops;
}

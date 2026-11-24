import React, { useMemo } from "react";
import { EmotionalTrendLineChart } from "./EmotionalTrendLineChart";

/**
 * Data point schema for the monthly savings/trend line chart.
 */
export interface TrendLineDataPoint {
  month: string;
  value: number;
}

/**
 * Props accepted by the TrendLine component.
 */
export interface TrendLineChartProps {
  data: TrendLineDataPoint[];
  color?: string;
  metricLabel?: string;
  className?: string;
}

/**
 * Monthly savings trend line chart with dynamic positive/negative behavioral coloring.
 * Reuses the common EmotionalTrendLineChart component with 'positive-growth' polarity.
 */
export function TrendLine({ data, className }: TrendLineChartProps) {
  const chartData = useMemo(() => data.map((d) => ({ label: d.month, value: d.value })), [data]);

  return (
    <EmotionalTrendLineChart
      data={chartData}
      polarity="positive-growth"
      colorTag="savings"
      className={className}
    />
  );
}

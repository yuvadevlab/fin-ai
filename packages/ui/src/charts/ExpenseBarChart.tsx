import React, { useMemo } from "react";
import { EmotionalTrendLineChart } from "./EmotionalTrendLineChart";

/**
 * Data point schema for the monthly expense trend chart.
 */
export interface ExpenseBarDataPoint {
  month: string;
  expense: number;
}

/**
 * Props accepted by the ExpenseBarChart component.
 */
export interface ExpenseBarChartProps {
  data: ExpenseBarDataPoint[];
  className?: string;
}

/**
 * Monthly expense trend line chart with dynamic positive/negative behavioral coloring.
 * Reuses the common EmotionalTrendLineChart component with 'positive-reduction' polarity.
 */
export function ExpenseBarChart({ data, className }: ExpenseBarChartProps) {
  const chartData = useMemo(() => data.map((d) => ({ label: d.month, value: d.expense })), [data]);

  return (
    <EmotionalTrendLineChart
      data={chartData}
      polarity="positive-reduction"
      colorTag="expense"
      className={className}
    />
  );
}

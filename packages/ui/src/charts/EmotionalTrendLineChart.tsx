import React, { useId, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyShort } from "@fin-ai/finance-engine";
import { axisProps, tooltipStyle } from "./chart-theme";
import {
  buildGradientStops,
  getPointColor,
  TrendDataPoint,
  TrendPolarity,
} from "./trend-line.utils";

export type { TrendDataPoint, TrendPolarity };

/** Props accepted by the EmotionalTrendLineChart component */
export interface EmotionalTrendLineChartProps {
  data: TrendDataPoint[];
  polarity?: TrendPolarity;
  colorTag?: string;
  className?: string;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  data?: TrendDataPoint[];
  polarity?: TrendPolarity;
}

function CustomMilestoneDot({
  cx,
  cy,
  index = 0,
  data = [],
  polarity = "positive-growth",
}: CustomDotProps) {
  if (cx === undefined || cy === undefined) return null;
  const color = getPointColor(index, data, polarity);

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill={color}
      stroke="var(--background, #09090b)"
      strokeWidth={1.5}
    />
  );
}

function CustomActiveDot({
  cx,
  cy,
  index = 0,
  data = [],
  polarity = "positive-growth",
}: CustomDotProps) {
  if (cx === undefined || cy === undefined) return null;
  const color = getPointColor(index, data, polarity);

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={color}
      stroke="var(--background, #09090b)"
      strokeWidth={2}
    />
  );
}

/**
 * Common, DRY emotional trend line chart component.
 * Uses standard production tooltip styling via tooltipStyle().
 * Dynamically computes SVG stroke segments and milestone dots based on behavioral polarity.
 * Guarantees single-color active dot rendering on hover without multi-color gradient bleeding.
 */
export function EmotionalTrendLineChart({
  data,
  polarity = "positive-growth",
  colorTag = "trend",
  className,
}: EmotionalTrendLineChartProps) {
  const rawId = useId();
  const gradientId = `${colorTag}-gradient-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const gradientStops = useMemo(() => buildGradientStops(data, polarity), [data, polarity]);

  return (
    <div className={`fn-chart-container ${className || ""}`.trim()}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          {gradientStops && (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="100%" y2="0">
                {gradientStops}
              </linearGradient>
            </defs>
          )}
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatCurrencyShort} />
          <Tooltip {...tooltipStyle()} formatter={(v) => formatCurrencyShort(Number(v))} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={gradientStops ? `url(#${gradientId})` : "var(--primary)"}
            strokeWidth={2.5}
            dot={<CustomMilestoneDot data={data} polarity={polarity} />}
            activeDot={<CustomActiveDot data={data} polarity={polarity} />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

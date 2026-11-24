import React, { useId, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
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
 * Emotional trend chart component with multi-colored horizontal
 * emotional segmentation and CashFlow-style vertical area color fade.
 * Renders the shaded area with an opacity mask and superimposes a 100% vibrant,
 * crisp stroke line on top so the stroke is never dimmed.
 */
export function EmotionalTrendLineChart({
  data,
  polarity = "positive-growth",
  colorTag = "trend",
  className,
}: EmotionalTrendLineChartProps) {
  const rawId = useId();
  const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const strokeGradId = `${colorTag}-stroke-${cleanId}`;
  const areaColorGradId = `${colorTag}-area-color-${cleanId}`;
  const maskGradId = `${colorTag}-mask-grad-${cleanId}`;
  const maskId = `${colorTag}-mask-${cleanId}`;

  const gradientStops = useMemo(() => buildGradientStops(data, polarity), [data, polarity]);

  return (
    <div className={`fn-chart-container ${className || ""}`.trim()}>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            {gradientStops && (
              <>
                <linearGradient id={strokeGradId} x1="0" y1="0" x2="100%" y2="0">
                  {gradientStops}
                </linearGradient>
                <linearGradient id={areaColorGradId} x1="0" y1="0" x2="100%" y2="0">
                  {gradientStops}
                </linearGradient>
              </>
            )}
            <linearGradient id={maskGradId} x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#000000" stopOpacity={0} />
            </linearGradient>
            <mask id={maskId}>
              <rect x="0" y="0" width="100%" height="100%" fill={`url(#${maskGradId})`} />
            </mask>
          </defs>

          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatCurrencyShort} />
          <Tooltip {...tooltipStyle()} formatter={(v) => formatCurrencyShort(Number(v))} />

          {/* 1. Subtle, masked multi-color vertical area fade underneath */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill={gradientStops ? `url(#${areaColorGradId})` : "var(--primary)"}
            mask={`url(#${maskId})`}
            legendType="none"
            tooltipType="none"
          />

          {/* 2. 100% full opacity, crisp, vibrant emotional stroke line on top */}
          <Line
            type="monotone"
            dataKey="value"
            stroke={gradientStops ? `url(#${strokeGradId})` : "var(--primary)"}
            strokeWidth={2.5}
            dot={<CustomMilestoneDot data={data} polarity={polarity} />}
            activeDot={<CustomActiveDot data={data} polarity={polarity} />}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

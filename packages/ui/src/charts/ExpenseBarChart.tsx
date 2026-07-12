import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, tooltipStyle, inrShort } from "./chart-theme";

interface ExpenseBarDataPoint {
  month: string;
  expense: number;
}

interface ExpenseBarChartProps {
  data: ExpenseBarDataPoint[];
}

export function ExpenseBarChart({ data }: ExpenseBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={inrShort} />
        <Tooltip {...tooltipStyle()} formatter={(v: any) => inrShort(Number(v))} />
        <Bar dataKey="expense" radius={[6, 6, 0, 0]} fill="oklch(0.63 0.14 156)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

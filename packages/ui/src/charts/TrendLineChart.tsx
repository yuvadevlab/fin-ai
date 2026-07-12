import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axisProps, tooltipStyle, inrShort } from "./chart-theme";

interface TrendLineDataPoint {
  month: string;
  value: number;
}

interface TrendLineChartProps {
  data: TrendLineDataPoint[];
}

export function TrendLine({ data }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={inrShort} />
        <Tooltip {...tooltipStyle()} formatter={(v) => inrShort(Number(v))} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="oklch(0.63 0.14 156)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "oklch(0.63 0.14 156)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

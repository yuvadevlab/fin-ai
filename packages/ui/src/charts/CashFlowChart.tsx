import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axisProps, tooltipStyle, inrShort } from "./chart-theme";

interface CashFlowDataPoint {
  month: string;
  income: number;
  expense: number;
}

interface CashFlowChartProps {
  data: CashFlowDataPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.63 0.14 156)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="oklch(0.63 0.14 156)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.02 260)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="oklch(0.55 0.02 260)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={inrShort} />
        <Tooltip {...tooltipStyle()} formatter={(value) => inrShort(Number(value ?? 0))} />
        <Area
          type="monotone"
          dataKey="income"
          stroke="oklch(0.63 0.14 156)"
          strokeWidth={2}
          fill="url(#incomeFill)"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="oklch(0.55 0.02 260)"
          strokeWidth={2}
          fill="url(#expenseFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

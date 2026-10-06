import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyShort } from "@finai/finance-engine";
import { axisProps, tooltipStyle } from "./chart-theme";

export interface CashFlowDataPoint {
  month: string;
  income: number;
  expense: number;
  investment?: number;
}

interface CashFlowChartProps {
  data: CashFlowDataPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Legend Indicator */}
      <div className="text-muted-foreground mb-2 flex items-center justify-end gap-3.5 pr-2 text-[11px] font-medium">
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-primary size-2 rounded-full" aria-hidden="true" />
          Income
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-destructive size-2 rounded-full" aria-hidden="true" />
          Expense
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-500" aria-hidden="true" />
          Investment
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="investmentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--investment, #3b82f6)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--investment, #3b82f6)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatCurrencyShort} />
          <Tooltip
            {...tooltipStyle()}
            formatter={(value, name) => [
              formatCurrencyShort(Number(value ?? 0)),
              typeof name === "string" ? name.charAt(0).toUpperCase() + name.slice(1) : name,
            ]}
          />

          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#incomeFill)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="var(--destructive)"
            strokeWidth={2}
            fill="url(#expenseFill)"
          />
          <Area
            type="monotone"
            dataKey="investment"
            name="Investment"
            stroke="var(--investment, #3b82f6)"
            strokeWidth={2}
            fill="url(#investmentFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

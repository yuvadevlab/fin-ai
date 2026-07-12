import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PIE_COLORS, tooltipStyle, inrShort } from "./chart-theme";

interface CategoryPieDataPoint {
  name: string;
  value: number;
}

interface CategoryPieProps {
  data: CategoryPieDataPoint[];
}

export function CategoryPie({ data }: CategoryPieProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Tooltip {...tooltipStyle()} formatter={(v: any) => inrShort(Number(v))} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

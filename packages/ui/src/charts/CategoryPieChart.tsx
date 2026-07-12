import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PIE_COLORS, tooltipStyle, inrShort } from "./chart-theme";

interface CategoryPieDataPoint {
  name: string;
  value: number;
}

interface CategoryPieProps {
  data: CategoryPieDataPoint[];
}

export function CategoryPie({ data }: CategoryPieProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Tooltip {...tooltipStyle()} formatter={(value) => inrShort(Number(value ?? 0))} />

        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          stroke="none"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export const PIE_COLORS = [
  "hsl(160 84% 39%)",
  "hsl(158 64% 52%)",
  "hsl(220 9% 46%)",
  "hsl(220 13% 69%)",
  "hsl(30 80% 55%)",
];

export const axisProps = {
  stroke: "hsl(220 9% 60%)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

export function tooltipStyle() {
  return {
    contentStyle: {
      background: "hsl(240 10% 4%)",
      border: "none",
      borderRadius: 8,
      color: "white",
      fontSize: 12,
      padding: "8px 12px",
    },
    labelStyle: { color: "hsl(220 9% 70%)", fontSize: 11 },
    itemStyle: { color: "white" },
  };
}

export function inrShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 100000) return sign + "₹" + (abs / 100000).toFixed(1) + "L";
  if (abs >= 1000) return sign + "₹" + Math.round(abs / 1000) + "k";
  return sign + "₹" + abs;
}

export const CHART_COLORS = PIE_COLORS;

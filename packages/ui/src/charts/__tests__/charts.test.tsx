import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExpenseBarChart } from "../ExpenseBarChart";
import { TrendLine } from "../TrendLineChart";
import { EmotionalTrendLineChart } from "../EmotionalTrendLineChart";

describe("Chart Emotion Components", () => {
  const sampleExpenseData = [
    { month: "Jan", expense: 45000 },
    { month: "Feb", expense: 38000 }, // reduced (positive)
    { month: "Mar", expense: 52000 }, // spike (alert)
  ];

  const sampleSavingsData = [
    { month: "Jan", value: 20000 },
    { month: "Feb", value: 25000 }, // growing (positive)
    { month: "Mar", value: 18000 }, // dipped (alert)
  ];

  describe("EmotionalTrendLineChart", () => {
    it("renders with positive-growth polarity without crashing", () => {
      const { container } = render(
        <EmotionalTrendLineChart
          data={[
            { label: "Jan", value: 1000 },
            { label: "Feb", value: 1500 },
          ]}
        />,
      );
      expect(container.querySelector(".fn-chart-container")).toBeInTheDocument();
    });

    it("renders with positive-reduction polarity without crashing", () => {
      const { container } = render(
        <EmotionalTrendLineChart
          data={[
            { label: "Jan", value: 5000 },
            { label: "Feb", value: 4000 },
          ]}
          polarity="positive-reduction"
        />,
      );
      expect(container.querySelector(".fn-chart-container")).toBeInTheDocument();
    });
  });

  describe("ExpenseBarChart", () => {
    it("renders expense trend line chart container", () => {
      const { container } = render(<ExpenseBarChart data={sampleExpenseData} />);
      expect(container.querySelector(".fn-chart-container")).toBeInTheDocument();
    });
  });

  describe("TrendLine", () => {
    it("renders savings trend line chart container", () => {
      const { container } = render(<TrendLine data={sampleSavingsData} />);
      expect(container.querySelector(".fn-chart-container")).toBeInTheDocument();
    });
  });
});

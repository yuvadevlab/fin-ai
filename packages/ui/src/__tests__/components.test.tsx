import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MoneyDisplay } from "../components/MoneyDisplay";
import { ScoreGauge } from "../components/ScoreGauge";

describe("UI Component Library (Unit Tests)", () => {
  describe("MoneyDisplay", () => {
    it("should format currency in INR by default", () => {
      render(<MoneyDisplay value={1000} />);
      // Match ₹1,000 or ₹1,000.00 depending on environment locale
      expect(screen.getByText(/₹\s?1,000/)).toBeInTheDocument();
    });

    it("should apply destructive styling for negative values", () => {
      render(<MoneyDisplay value={-500} />);
      const element = screen.getByText(/-₹\s?500/);
      expect(element).toHaveClass("text-destructive");
    });

    it("should apply primary styling for positive values when showSign is true", () => {
      render(<MoneyDisplay value={1000} showSign />);
      const element = screen.getByText(/\+\s?₹\s?1,000/);
      expect(element).toHaveClass("text-primary");
    });

    it("should mask value and provide screen-reader text when masked is true", () => {
      render(<MoneyDisplay value={1000} masked />);
      expect(screen.getByText("Amount hidden for privacy")).toBeInTheDocument();
      expect(screen.getByText(/₹\s?••••••/)).toBeInTheDocument();
    });
  });

  describe("ScoreGauge", () => {
    it("should render the score text correctly", () => {
      render(<ScoreGauge score={85} />);
      expect(screen.getByText("85")).toBeInTheDocument();
    });

    it("should clamp the score between 0 and maxScore", () => {
      render(<ScoreGauge score={150} maxScore={100} />);
      expect(screen.getByText("100")).toBeInTheDocument();

      const gauge = screen.getByRole("progressbar");
      expect(gauge).toHaveAttribute("aria-valuenow", "100");
    });

    it("should apply the correct color based on the score threshold", () => {
      const { rerender } = render(<ScoreGauge score={85} />);
      expect(screen.getByText("85")).toBeInTheDocument();
      // The color is applied to the circle and the rating.
      // We'll check the rating text color.
      rerender(<ScoreGauge score={85} showRating rating="Excellent" />);
      expect(screen.getByText("Excellent")).toHaveClass("text-primary");

      rerender(<ScoreGauge score={70} showRating rating="Good" />);
      expect(screen.getByText("Good")).toHaveClass("text-amber-500");

      rerender(<ScoreGauge score={40} showRating rating="Poor" />);
      expect(screen.getByText("Poor")).toHaveClass("text-destructive");
    });

    it("should have correct accessibility attributes", () => {
      render(<ScoreGauge score={75} label="Points" />);
      const gauge = screen.getByRole("progressbar");
      expect(gauge).toHaveAttribute("aria-valuenow", "75");
      expect(gauge).toHaveAttribute("aria-valuemin", "0");
      expect(gauge).toHaveAttribute("aria-valuemax", "100");
      expect(gauge).toHaveAttribute("aria-label", "Score: 75 Points");
    });
  });
});

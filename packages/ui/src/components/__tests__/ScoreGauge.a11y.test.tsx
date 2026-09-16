import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe } from "vitest-axe";
import { ScoreGauge } from "../ScoreGauge";

describe("ScoreGauge A11y", () => {
  it("should have no accessibility violations with default props", async () => {
    const { container } = render(<ScoreGauge score={82} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations with rating label and custom description", async () => {
    const { container } = render(
      <ScoreGauge score={68} maxScore={100} showRating rating="Good" label="Financial Health" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

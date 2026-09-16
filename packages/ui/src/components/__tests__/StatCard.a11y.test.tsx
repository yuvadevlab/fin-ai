import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe } from "vitest-axe";
import { StatCard } from "../StatCard";

describe("StatCard A11y", () => {
  it("should have no accessibility violations with trend and hint", async () => {
    const { container } = render(
      <StatCard
        label="Net Worth"
        value="₹12,45,000"
        trend={{ kind: "up", value: "+8.3%" }}
        hint="vs last month"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

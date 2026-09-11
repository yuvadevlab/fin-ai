import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe } from "vitest-axe";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge A11y", () => {
  it("should have no accessibility violations for ON_TRACK", async () => {
    const { container } = render(<StatusBadge status="ON_TRACK" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations for NEAR_LIMIT", async () => {
    const { container } = render(<StatusBadge status="NEAR_LIMIT" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations for OVER", async () => {
    const { container } = render(<StatusBadge status="OVER" overText="Over Budget" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

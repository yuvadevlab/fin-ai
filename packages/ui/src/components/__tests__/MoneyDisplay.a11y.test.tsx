import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe } from "vitest-axe";
import { MoneyDisplay } from "../MoneyDisplay";

describe("MoneyDisplay A11y", () => {
  it("should have no accessibility violations in standard mode", async () => {
    const { container } = render(<MoneyDisplay value={125000} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations when masked", async () => {
    const { container } = render(<MoneyDisplay value={125000} masked />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations with negative value and showSign", async () => {
    const { container } = render(<MoneyDisplay value={-4500} showSign />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

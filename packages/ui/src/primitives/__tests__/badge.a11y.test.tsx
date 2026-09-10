import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe } from "vitest-axe";
import { Badge } from "../badge";

describe("Badge A11y", () => {
  it("should have no accessibility violations with default variant", async () => {
    const { container } = render(<Badge>Completed</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations with outline variant", async () => {
    const { container } = render(<Badge variant="outline">Pending</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

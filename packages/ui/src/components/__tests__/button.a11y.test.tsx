import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe } from "vitest-axe";
import { Button } from "@yuva-devlab/ui";

describe("Button A11y", () => {
  it("should have no accessibility violations in default state", async () => {
    const { container } = render(<Button>Save Changes</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations when disabled", async () => {
    const { container } = render(<Button disabled>Disabled Action</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations with destructive variant", async () => {
    const { container } = render(<Button variant="destructive">Delete Item</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

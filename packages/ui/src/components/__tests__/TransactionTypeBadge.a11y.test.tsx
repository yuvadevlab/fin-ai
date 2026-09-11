import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe } from "vitest-axe";
import { TransactionTypeBadge } from "../TransactionTypeBadge";
import type { TransactionType } from "@finai/shared-types";

describe("TransactionTypeBadge A11y", () => {
  const types: TransactionType[] = ["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT", "GOAL"];

  types.forEach((type) => {
    it(`should have no accessibility violations for ${type}`, async () => {
      const { container } = render(<TransactionTypeBadge type={type} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

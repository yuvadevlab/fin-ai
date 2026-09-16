import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe } from "vitest-axe";
import { Pagination } from "../Pagination";

describe("Pagination A11y", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(
      <Pagination
        currentPage={2}
        totalPages={5}
        pageSize={10}
        totalItems={48}
        onPageChange={vi.fn()}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

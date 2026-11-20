import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TableSkeleton } from "../table-skeleton.js";

describe("TableSkeleton", () => {
  it("renders 10 shimmer rows by default, or the requested count", () => {
    const { container, rerender } = render(<TableSkeleton />);
    expect(container.firstElementChild?.children).toHaveLength(10);
    rerender(<TableSkeleton rows={3} />);
    expect(container.firstElementChild?.children).toHaveLength(3);
  });
});

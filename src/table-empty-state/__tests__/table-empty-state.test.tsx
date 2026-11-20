import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TableEmptyState } from "../table-empty-state.js";

describe("TableEmptyState", () => {
  it("shows the default and a custom message", () => {
    const { rerender } = render(<TableEmptyState />);
    expect(screen.getByText("Tidak ada data")).toBeInTheDocument();
    rerender(<TableEmptyState message="Belum ada laporan" />);
    expect(screen.getByText("Belum ada laporan")).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { Pagination } from "../pagination.js";
import type { PaginationProps } from "../pagination-types.js";

function pageLabels() {
  return screen
    .getAllByRole("button")
    .filter((b) => !b.hasAttribute("aria-label"))
    .map((b) => b.textContent);
}

describe("Pagination", () => {
  it("reports the 1-based page to onChange", () => {
    expectTypeOf<PaginationProps["onChange"]>().toEqualTypeOf<
      ((page: number) => void) | undefined
    >();
  });

  it("shows a 5-page window with jump buttons at the gaps", () => {
    render(<Pagination total={200} current={10} pageSize={10} />);

    expect(pageLabels()).toEqual(["8", "9", "10", "11", "12"]);
    expect(screen.getByRole("button", { name: "Mundur 5 halaman" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Maju 5 halaman" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toHaveAttribute("aria-current", "page");
  });

  it("formats page numbers with Indonesian grouping", () => {
    render(<Pagination total={243120} current={24312} pageSize={10} />);

    expect(screen.getByRole("button", { name: "24.312" })).toHaveTextContent("24.312");
  });

  it("reports the target page through onChange, clamped to the range", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Pagination total={200} current={18} pageSize={10} onChange={onChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Halaman berikutnya" }));
    expect(onChange).toHaveBeenLastCalledWith(19);

    fireEvent.click(screen.getByRole("button", { name: "Mundur 5 halaman" }));
    expect(onChange).toHaveBeenLastCalledWith(13);

    fireEvent.click(screen.getByRole("button", { name: "16" }));
    expect(onChange).toHaveBeenLastCalledWith(16);

    fireEvent.click(screen.getByRole("button", { name: "Halaman sebelumnya" }));
    expect(onChange).toHaveBeenLastCalledWith(17);

    rerender(<Pagination total={200} current={1} pageSize={10} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Maju 5 halaman" }));
    expect(onChange).toHaveBeenLastCalledWith(6);
  });

  it("disables the arrows at the ends and everything when disabled", () => {
    const { rerender } = render(<Pagination total={30} current={1} pageSize={10} />);
    expect(screen.getByRole("button", { name: "Halaman sebelumnya" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Halaman berikutnya" })).toBeEnabled();

    rerender(<Pagination total={30} current={2} pageSize={10} disabled />);
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });

  it("defaults to page 1 of 10-row pages", () => {
    render(<Pagination total={25} />);
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(pageLabels()).toEqual(["1", "2", "3"]);
  });
});

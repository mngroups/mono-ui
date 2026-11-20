import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test-utils/render.js";

import { ListPagination, ListSearchInput, ListToolbar } from "../list-toolbar.js";

vi.mock("../../dynamic-modal/dynamic-modal.js", () => ({
  DynamicModal: ({
    open,
    onOpenChange,
    title,
    children,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    children?: ReactNode;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
        <button type="button" onClick={() => onOpenChange(false)}>
          Tutup
        </button>
      </div>
    ) : null,
}));

afterEach(() => {
  vi.restoreAllMocks();
});

/** The mobile pager's buttons render after the desktop `<Pagination>`'s. */
function mobileButton(name: string) {
  const all = screen.getAllByRole("button", { name });
  return all[all.length - 1];
}

describe("ListPagination", () => {
  it("renders nothing when everything fits on one page", () => {
    renderWithProviders(<ListPagination total={10} page={1} pageSize={10} onChange={vi.fn()} />);
    expect(screen.queryByRole("textbox", { name: "Halaman" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("moves with the mobile previous/next buttons and disables them at the edges", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(
      <ListPagination total={30} page={1} pageSize={10} onChange={onChange} />
    );
    expect(mobileButton("Halaman sebelumnya")).toBeDisabled();
    await user.click(mobileButton("Halaman berikutnya"));
    expect(onChange).toHaveBeenCalledWith(2);

    rerender(<ListPagination total={30} page={3} pageSize={10} onChange={onChange} />);
    expect(mobileButton("Halaman berikutnya")).toBeDisabled();
    // Page prop changed: the jumper follows it.
    expect(screen.getByRole("textbox", { name: "Halaman" })).toHaveValue("3");
    await user.click(mobileButton("Halaman sebelumnya"));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it("commits the jumper on Enter / blur, clamping and ignoring junk", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<ListPagination total={95} page={2} pageSize={10} onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Halaman" });

    // Non-digits are stripped.
    await user.clear(input);
    await user.type(input, "a");
    expect(input).toHaveValue("");
    // Empty commit resets to the current page.
    fireEvent.blur(input);
    expect(input).toHaveValue("2");
    expect(onChange).not.toHaveBeenCalled();

    // Same page: no change event.
    await user.clear(input);
    await user.type(input, "2{Enter}");
    expect(onChange).not.toHaveBeenCalled();

    // Out of range: clamped to the last page.
    await user.clear(input);
    await user.type(input, "99");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(10);
    expect(input).toHaveValue("10");

    // Other keys don't commit.
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders the desktop jumper row and centers it once the row wraps", () => {
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (
      this: HTMLElement
    ) {
      // The jumper (last child of the row) sits below the pager.
      const holdsJumper = this.querySelector('input[aria-label="Halaman"]') !== null;
      return holdsJumper && !this.classList.contains("flex-wrap") ? 40 : 0;
    });
    renderWithProviders(
      <ListPagination total={120000} page={1} pageSize={10} onChange={vi.fn()} showJumper />
    );
    const inputs = screen.getAllByRole("textbox", { name: "Halaman" });
    expect(inputs).toHaveLength(2);
    expect(inputs[0].style.width).toBe("calc(5ch + 2px + 1rem)");
    const row = inputs[0].closest("div.flex-wrap") as HTMLElement;
    expect(row).toHaveClass("justify-center");
  });

  it("keeps the jumper row spread when it does not wrap", () => {
    renderWithProviders(
      <ListPagination total={30} page={1} pageSize={10} onChange={vi.fn()} showJumper />
    );
    const [desktop] = screen.getAllByRole("textbox", { name: "Halaman" });
    expect(desktop.style.width).toBe("calc(2ch + 2px + 1rem)");
    expect(desktop.closest("div.flex-wrap")).toHaveClass("justify-between");
  });

  it("skips wrap detection when ResizeObserver is unavailable", () => {
    // The setup file defines it writable but not configurable: assign, don't stub.
    const original = globalThis.ResizeObserver;
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = undefined;
    try {
      renderWithProviders(
        <ListPagination total={30} page={1} pageSize={10} onChange={vi.fn()} showJumper />
      );
      const [desktop] = screen.getAllByRole("textbox", { name: "Halaman" });
      expect(desktop.closest("div.flex-wrap")).toHaveClass("justify-between");
    } finally {
      globalThis.ResizeObserver = original;
    }
  });

  it("treats an empty row as not wrapped", () => {
    vi.spyOn(Element.prototype, "firstElementChild", "get").mockReturnValue(null);
    renderWithProviders(
      <ListPagination total={30} page={1} pageSize={10} onChange={vi.fn()} showJumper />
    );
    vi.restoreAllMocks();
    const [desktop] = screen.getAllByRole("textbox", { name: "Halaman" });
    expect(desktop.closest("div.flex-wrap")).toHaveClass("justify-between");
  });
});

describe("ListSearchInput", () => {
  it("falls back to a generic placeholder without a label", () => {
    renderWithProviders(
      <ListSearchInput value="" onChange={vi.fn()} label={undefined as unknown as string} />
    );
    expect(screen.getByPlaceholderText("Cari")).toBeInTheDocument();
  });

  it("clears the query with the clear button or Escape", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(
      <ListSearchInput value="" onChange={onChange} label="Cari site" />
    );
    expect(screen.queryByRole("button", { name: "Hapus pencarian" })).not.toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "{Escape}");
    expect(onChange).not.toHaveBeenCalled();

    rerender(<ListSearchInput value="abc" onChange={onChange} label="Cari site" />);
    await user.click(screen.getByRole("button", { name: "Hapus pencarian" }));
    expect(onChange).toHaveBeenLastCalledWith("");
    onChange.mockClear();
    await user.type(screen.getByRole("searchbox"), "{Escape}");
    expect(onChange).toHaveBeenCalledWith("");
  });
});

describe("ListToolbar", () => {
  it("renders only the search box when there are no filters", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    renderWithProviders(
      <ListToolbar search="abc" onSearchChange={onSearchChange} searchTestId="search" />
    );
    const input = screen.getByRole("searchbox", { name: "Cari" });
    expect(input).toHaveValue("abc");
    await user.type(input, "d");
    expect(onSearchChange).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Buka filter" })).not.toBeInTheDocument();
    expect(screen.queryByText("Reset")).not.toBeInTheDocument();
  });

  it("renders a search box with an empty value when search is omitted", () => {
    renderWithProviders(<ListToolbar onSearchChange={vi.fn()} />);
    expect(screen.getByRole("searchbox", { name: "Cari" })).toHaveValue("");
  });

  it("shows inline filters, the badge, reset and action; sheet uses filters(true)", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const filters = vi.fn((inSheet: boolean) => (
      <span>{inSheet ? "sheet-filter" : "row-filter"}</span>
    ));
    renderWithProviders(
      <ListToolbar
        filters={filters}
        activeFilterCount={2}
        onResetFilters={onReset}
        action={<span>Tambah</span>}
        trigger="block"
        triggerLabel="Saring"
        testIdPrefix="tb"
      />
    );
    expect(screen.getByText("row-filter")).toBeInTheDocument();
    expect(screen.getByText("Tambah")).toBeInTheDocument();
    const trigger = screen.getByTestId("tb-filter-trigger");
    expect(trigger).toHaveTextContent("Saring2");

    // Inline Reset is desktop-only: on a 360px row it squeezed the search box until the
    // input overflowed onto the filter trigger. Mobile resets from the filter sheet.
    expect(screen.getByTestId("tb-reset-filter-button")).toHaveClass("hidden", "lg:inline-flex");

    await user.click(screen.getByTestId("tb-reset-filter-button"));
    expect(onReset).toHaveBeenCalledTimes(1);

    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Filter" });
    expect(within(dialog).getByText("sheet-filter")).toBeInTheDocument();
    await user.click(within(dialog).getByTestId("tb-sheet-reset-button"));
    expect(onReset).toHaveBeenCalledTimes(2);
    await user.click(within(dialog).getByTestId("tb-sheet-apply-button"));
    expect(within(dialog).queryByText("Lihat hasil")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Reopen once already mounted.
    await user.click(trigger);
    expect(await screen.findByRole("dialog", { name: "Filter" })).toBeInTheDocument();
    await user.click(screen.getByText("Tutup"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("holds draft filters until Terapkan and resets to emptyValues", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    function Harness() {
      const [values, setValues] = useState({ site: "a" });
      return (
        <ListToolbar
          activeFilterCount={1}
          draft={{
            values,
            onApply: (v) => {
              onApply(v);
              setValues(v);
            },
            emptyValues: { site: "" },
            render: (draft, setDraft) => (
              <>
                <output data-testid="draft">{draft.site || "kosong"}</output>
                <button type="button" onClick={() => setDraft({ site: "b" })}>
                  Pilih B
                </button>
              </>
            ),
          }}
        />
      );
    }

    renderWithProviders(<Harness />);
    await user.click(screen.getByRole("button", { name: "Buka filter" }));
    const dialog = await screen.findByRole("dialog", { name: "Filter" });
    expect(within(dialog).getByTestId("draft")).toHaveTextContent("a");
    await user.click(within(dialog).getByText("Pilih B"));
    expect(within(dialog).getByTestId("draft")).toHaveTextContent("b");
    await user.click(within(dialog).getByTestId("list-toolbar-sheet-reset-button"));
    expect(within(dialog).getByTestId("draft")).toHaveTextContent("kosong");
    expect(onApply).not.toHaveBeenCalled();
    await user.click(within(dialog).getByText("Terapkan"));
    expect(onApply).toHaveBeenCalledWith({ site: "" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("draft without emptyValues resets through onResetFilters; undefined draft values never apply", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const onReset = vi.fn();
    renderWithProviders(
      <ListToolbar<string | undefined>
        canReset
        onResetFilters={onReset}
        draft={{ values: undefined, onApply, render: () => <span>draft-ui</span> }}
      />
    );
    await user.click(screen.getByRole("button", { name: "Buka filter" }));
    const dialog = await screen.findByRole("dialog", { name: "Filter" });
    // No draft values and no `filters`: the grid stays empty.
    expect(within(dialog).queryByText("draft-ui")).not.toBeInTheDocument();
    await user.click(within(dialog).getByTestId("list-toolbar-sheet-reset-button"));
    expect(onReset).toHaveBeenCalled();
    await act(async () => {
      within(dialog).getByText("Terapkan").click();
    });
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

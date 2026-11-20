import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test-utils/render.js";

import {
  type FilterDropdownOption,
  MultiSelectDropdown,
  MultiSelectOptionDropdown,
  SingleSelectOptionDropdown,
} from "../filter-dropdown.js";

const isMobileMock = vi.fn(() => false);
vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => isMobileMock(),
}));

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

const OPTIONS: FilterDropdownOption[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

const MANY: FilterDropdownOption[] = Array.from({ length: 70 }, (_, i) => ({
  value: `v${i}`,
  label: `Opsi ${i}`,
}));

/** Scroll the list element so it reads as "near the bottom". */
function scrollNearBottom(el: HTMLElement) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: 1000 });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: 200 });
  Object.defineProperty(el, "scrollTop", { configurable: true, value: 750 });
  fireEvent.scroll(el);
}

function scrollFarFromBottom(el: HTMLElement) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: 1000 });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: 200 });
  Object.defineProperty(el, "scrollTop", { configurable: true, value: 0 });
  fireEvent.scroll(el);
}

function listOf(option: HTMLElement) {
  // option button -> list container
  return option.closest("button")?.parentElement as HTMLElement;
}

function StatefulMulti(props: {
  initial?: string[];
  options?: FilterDropdownOption[];
  showSelectAll?: boolean;
  variant?: "dropdown" | "inline";
  disabled?: boolean;
  fullWidth?: boolean;
  onChangeSpy?: (next: string[]) => void;
}) {
  const [value, setValue] = useState<string[]>(props.initial ?? []);
  return (
    <MultiSelectOptionDropdown
      label="Site"
      options={props.options ?? OPTIONS}
      value={value}
      onChange={(next) => {
        props.onChangeSpy?.(next);
        setValue(next);
      }}
      showSelectAll={props.showSelectAll}
      variant={props.variant}
      disabled={props.disabled}
      fullWidth={props.fullWidth}
      testId="multi-trigger"
    />
  );
}

beforeEach(() => {
  isMobileMock.mockReturnValue(false);
});

describe("MultiSelectOptionDropdown (desktop popover)", () => {
  it("opens, toggles options, pins selected first, searches and clears", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    renderWithProviders(<StatefulMulti initial={["c"]} onChangeSpy={spy} />);

    const trigger = screen.getByTestId("multi-trigger");
    expect(within(trigger).getByText("1")).toBeInTheDocument();
    await user.click(trigger);

    const labels = screen.getAllByText(/Alpha|Beta|Gamma/).map((n) => n.textContent);
    // Selected option is pinned to the top on open.
    expect(labels[0]).toBe("Gamma");

    await user.click(screen.getByText("Alpha"));
    expect(spy).toHaveBeenLastCalledWith(["c", "a"]);
    await user.click(screen.getByText("Alpha"));
    expect(spy).toHaveBeenLastCalledWith(["c"]);

    await user.type(screen.getByPlaceholderText("Cari site"), "zzz");
    expect(screen.getByText("Tidak ditemukan")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hapus pencarian" }));
    expect(screen.getByText("Beta")).toBeInTheDocument();

    await user.click(screen.getByText("Hapus semua"));
    expect(spy).toHaveBeenLastCalledWith([]);
  });

  it("selects every option with Pilih semua and hides it when all are picked", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    renderWithProviders(<StatefulMulti showSelectAll fullWidth onChangeSpy={spy} />);
    await user.click(screen.getByTestId("multi-trigger"));
    expect(screen.queryByText("Hapus semua")).not.toBeInTheDocument();
    await user.click(screen.getByText("Pilih semua"));
    expect(spy).toHaveBeenLastCalledWith(["a", "b", "c"]);
    expect(screen.queryByText("Pilih semua")).not.toBeInTheDocument();
  });

  it("reveals more options on scroll near the bottom (infinite scroll)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StatefulMulti options={MANY} />);
    await user.click(screen.getByTestId("multi-trigger"));
    expect(screen.queryByText("Opsi 30")).not.toBeInTheDocument();
    const list = listOf(screen.getByText("Opsi 0"));
    scrollFarFromBottom(list);
    expect(screen.queryByText("Opsi 30")).not.toBeInTheDocument();
    scrollNearBottom(list);
    expect(screen.getByText("Opsi 30")).toBeInTheDocument();
    scrollNearBottom(list);
    expect(screen.getByText("Opsi 69")).toBeInTheDocument();
    // Already showing everything: count stays put.
    scrollNearBottom(list);
    expect(screen.getByText("Opsi 69")).toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StatefulMulti disabled />);
    await user.click(screen.getByTestId("multi-trigger"));
    expect(screen.queryByPlaceholderText("Cari site")).not.toBeInTheDocument();
  });
});

describe("MultiSelectOptionDropdown (mobile sheet)", () => {
  it("opens a bottom sheet from the trigger and closes it", async () => {
    isMobileMock.mockReturnValue(true);
    const user = userEvent.setup();
    renderWithProviders(<StatefulMulti />);
    await user.click(screen.getByTestId("multi-trigger"));
    const dialog = screen.getByRole("dialog", { name: "Site" });
    await user.click(within(dialog).getByText("Beta"));
    expect(within(screen.getByTestId("multi-trigger")).getByText("1")).toBeInTheDocument();
    await user.click(within(dialog).getByText("Tutup"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("MultiSelectOptionDropdown (inline variant)", () => {
  it("expands in place and collapses again", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StatefulMulti variant="inline" initial={["a"]} />);
    const toggle = screen.getByTestId("multi-trigger");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(within(toggle).getByText("1")).toBeInTheDocument();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByPlaceholderText("Cari site")).toBeInTheDocument();
    await user.click(toggle);
    expect(screen.queryByPlaceholderText("Cari site")).not.toBeInTheDocument();
  });

  it("renders without an active badge when nothing is selected", () => {
    renderWithProviders(<StatefulMulti variant="inline" />);
    expect(within(screen.getByTestId("multi-trigger")).queryByText("0")).not.toBeInTheDocument();
  });
});

function StatefulSingle(props: {
  initial?: string | null;
  options?: FilterDropdownOption[];
  neutralValue?: string | null;
  fullWidth?: boolean;
  onChangeSpy?: (v: string) => void;
}) {
  const [value, setValue] = useState<string | null>(props.initial ?? null);
  return (
    <SingleSelectOptionDropdown
      label="Status"
      options={props.options ?? OPTIONS}
      value={value}
      onChange={(next) => {
        props.onChangeSpy?.(next);
        setValue(next);
      }}
      neutralValue={props.neutralValue}
      fullWidth={props.fullWidth}
      testId="single-trigger"
    />
  );
}

describe("SingleSelectOptionDropdown", () => {
  it("shows the label until something is selected, then the option label + badge", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    renderWithProviders(<StatefulSingle onChangeSpy={spy} />);
    const trigger = screen.getByTestId("single-trigger");
    expect(trigger).toHaveTextContent("Status");
    await user.click(trigger);

    await user.type(screen.getByPlaceholderText("Cari status"), "zzz");
    expect(screen.getByText("Tidak ditemukan")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hapus pencarian" }));

    await user.click(screen.getByText("Beta"));
    expect(spy).toHaveBeenCalledWith("b");
    expect(screen.getByTestId("single-trigger")).toHaveTextContent("Beta1");
    expect(screen.queryByPlaceholderText("Cari status")).not.toBeInTheDocument();
  });

  it("marks the checked option and hides the badge for the neutral value", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StatefulSingle initial="a" neutralValue="a" fullWidth />);
    const trigger = screen.getByTestId("single-trigger");
    expect(trigger).toHaveTextContent("Alpha");
    expect(within(trigger).queryByText("1")).not.toBeInTheDocument();
    await user.click(trigger);
    expect(screen.getAllByText("Alpha").length).toBeGreaterThan(1);
  });

  it("reveals more options on scroll", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StatefulSingle options={MANY} />);
    await user.click(screen.getByTestId("single-trigger"));
    const list = listOf(screen.getByText("Opsi 0"));
    scrollFarFromBottom(list);
    expect(screen.queryByText("Opsi 30")).not.toBeInTheDocument();
    scrollNearBottom(list);
    scrollNearBottom(list);
    scrollNearBottom(list);
    expect(screen.getByText("Opsi 69")).toBeInTheDocument();
  });

  it("uses a bottom sheet on mobile", async () => {
    isMobileMock.mockReturnValue(true);
    const user = userEvent.setup();
    renderWithProviders(<StatefulSingle />);
    await user.click(screen.getByTestId("single-trigger"));
    const dialog = screen.getByRole("dialog", { name: "Status" });
    await user.click(within(dialog).getByText("Gamma"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("single-trigger")).toHaveTextContent("Gamma");
  });
});

function StatefulLegacy({ onChangeSpy }: { onChangeSpy?: (next: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <MultiSelectDropdown
      label="Unit"
      options={["DT-01", "DT-02"]}
      value={value}
      onChange={(next) => {
        onChangeSpy?.(next);
        setValue(next);
      }}
    />
  );
}

describe("MultiSelectDropdown", () => {
  it("toggles string options, searches and clears all", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    renderWithProviders(<StatefulLegacy onChangeSpy={spy} />);
    await user.click(screen.getByRole("button", { name: /Unit/ }));
    expect(screen.queryByText("Hapus semua")).not.toBeInTheDocument();

    await user.click(screen.getByText("DT-01"));
    expect(spy).toHaveBeenLastCalledWith(["DT-01"]);
    await user.click(screen.getByText("DT-02"));
    await user.click(screen.getByText("DT-02"));
    expect(spy).toHaveBeenLastCalledWith(["DT-01"]);

    await user.type(screen.getByPlaceholderText("Cari unit"), "zz");
    expect(screen.getByText("Tidak ditemukan")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hapus pencarian" }));

    await user.click(screen.getByText("Hapus semua"));
    expect(spy).toHaveBeenLastCalledWith([]);
  });
});

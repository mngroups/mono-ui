import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test-utils/render.js";

import { DateRangeFilterControl } from "../filter-sections.js";

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

vi.mock("../../ui/calendar.js", () => ({
  Calendar: ({ onSelect }: { onSelect: (range: unknown) => void }) => (
    <button type="button" onClick={() => onSelect({ from: new Date(2026, 0, 5) })}>
      pilih-tanggal
    </button>
  ),
}));

describe("DateRangeFilterControl", () => {
  it("shows the label when empty and opens the calendar sheet", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<DateRangeFilterControl value={undefined} onChange={onChange} />);
    const trigger = screen.getByRole("button", { name: /Rentang tanggal/ });
    expect(within(trigger).queryByText("1")).not.toBeInTheDocument();
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Rentang tanggal" });
    await user.click(within(dialog).getByText("pilih-tanggal"));
    expect(onChange).toHaveBeenCalledWith({ from: new Date(2026, 0, 5) });
    await user.click(within(dialog).getByText("Terapkan"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("summarises a single day and resets the range", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <DateRangeFilterControl
        label="Tanggal"
        value={{ from: new Date(2026, 0, 5) }}
        onChange={onChange}
        fullWidth={false}
      />
    );
    const trigger = screen.getByRole("button", { name: /05 Jan 2026/ });
    expect(within(trigger).getByText("1")).toBeInTheDocument();
    await user.click(trigger);
    await user.click(screen.getByText("Reset"));
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("summarises a full range", () => {
    renderWithProviders(
      <DateRangeFilterControl
        value={{ from: new Date(2026, 0, 5), to: new Date(2026, 1, 9) }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /05 Jan – 09 Feb 2026/ })).toBeInTheDocument();
  });
});

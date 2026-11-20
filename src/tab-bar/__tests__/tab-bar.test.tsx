import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TabBar } from "../tab-bar.js";

const ITEMS = [
  { key: "FUEL", label: "Fuel" },
  { key: "BOUNDARY", label: "Boundary" },
] as const;

describe("TabBar", () => {
  it("marks the active tab as selected", () => {
    render(<TabBar items={ITEMS} active="BOUNDARY" onChange={() => {}} />);

    expect(screen.getByRole("tab", { name: "Boundary" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Fuel" })).toHaveAttribute("aria-selected", "false");
  });

  it("reports the clicked tab key", () => {
    const onChange = vi.fn();
    render(<TabBar items={ITEMS} active="FUEL" onChange={onChange} />);

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Boundary" }));
    fireEvent.mouseUp(screen.getByRole("tab", { name: "Boundary" }));
    fireEvent.click(screen.getByRole("tab", { name: "Boundary" }));

    expect(onChange).toHaveBeenCalledWith("BOUNDARY");
  });

  it("bleeds the tab strip to the screen edge on mobile when asked", () => {
    render(<TabBar items={ITEMS} active="FUEL" onChange={() => {}} bleed aria-label="Domain" />);
    expect(screen.getByRole("tablist")).toHaveClass("mobile-bleed-x");
  });
});

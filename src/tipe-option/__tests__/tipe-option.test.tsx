import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TipeOptionGroup } from "../tipe-option.js";

const OPTIONS = [
  { value: "root", label: "Level root", desc: "Semua site" },
  { value: "site", label: "Level site" },
  { value: "kontraktor", label: "Level kontraktor", disabled: true, badge: "Belum tersedia" },
] as const;

describe("TipeOptionGroup", () => {
  it("renders an accessible radio group reflecting the value", () => {
    render(
      <TipeOptionGroup
        aria-label="Level boundary"
        options={OPTIONS}
        value="site"
        onChange={() => {}}
      />
    );

    expect(screen.getByRole("radiogroup", { name: "Level boundary" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Level site/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Level kontraktor/ })).toBeDisabled();
    expect(screen.getByText("Semua site")).toBeInTheDocument();
  });

  it("reports the picked option", async () => {
    const onChange = vi.fn();
    render(
      <TipeOptionGroup
        aria-label="Level boundary"
        options={OPTIONS}
        value="site"
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByText("Level root"));

    expect(onChange).toHaveBeenCalledWith("root");
  });

  it("starts with nothing selected when the value is null", () => {
    render(
      <TipeOptionGroup
        aria-label="Level boundary"
        options={OPTIONS}
        value={null}
        onChange={() => {}}
      />
    );
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked();
  });
});

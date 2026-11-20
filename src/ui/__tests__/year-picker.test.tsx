import { witaNow } from "@mono/utils";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { YearPicker } from "../year-picker.js";

const mobile = vi.hoisted(() => ({ value: false }));
vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => mobile.value,
}));

beforeEach(() => {
  mobile.value = false;
});

describe("YearPicker", () => {
  it("pages within the allowed years and picks one from the popover", async () => {
    const user = userEvent.setup();
    const onSelectYear = vi.fn();
    render(
      <YearPicker
        year={2025}
        minYear={2020}
        maxYear={2030}
        onSelectYear={onSelectYear}
        sideOffset={4}
      />
    );
    await user.click(screen.getByRole("button", { name: /2025/ }));

    expect(screen.getByText("2016 – 2027")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2019" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "2025", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tahun sebelumnya" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Tahun berikutnya" }));
    expect(screen.getByText("2028 – 2039")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2031" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Tahun berikutnya" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Tahun sebelumnya" }));
    await user.click(screen.getByRole("button", { name: "2022" }));
    expect(onSelectYear).toHaveBeenCalledWith(2022);
    expect(screen.queryByText("2016 – 2027")).not.toBeInTheDocument();
  });

  it("reopens on the selected year's page", async () => {
    const user = userEvent.setup();
    render(<YearPicker year={2025} maxYear={2100} onSelectYear={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /2025/ }));
    await user.click(screen.getByRole("button", { name: "Tahun berikutnya" }));
    expect(screen.getByText("2028 – 2039")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /2025/ }));
    expect(screen.getByText("2016 – 2027")).toBeInTheDocument();
  });

  it("caps at the current WITA year by default and uses a bottom sheet on mobile", async () => {
    mobile.value = true;
    const user = userEvent.setup();
    const onSelectYear = vi.fn();
    const current = witaNow().year();
    render(<YearPicker year={current} onSelectYear={onSelectYear} title="Tahun data" />);
    await user.click(screen.getByRole("button", { name: new RegExp(String(current)) }));
    expect(screen.getByText("Tahun data")).toBeInTheDocument();
    if (current % 12 !== 11) {
      expect(screen.getByRole("button", { name: String(current + 1) })).toBeDisabled();
    }
    // vaul's drag handler needs pointer capture jsdom lacks; a plain click is enough.
    fireEvent.click(screen.getByRole("button", { name: String(current), pressed: true }));
    expect(onSelectYear).toHaveBeenCalledWith(current);
  });
});

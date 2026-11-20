import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "../calendar.js";

const TODAY = new Date(2026, 4, 15);

describe("Calendar", () => {
  it("jumps the view back to today and selects it", async () => {
    const user = userEvent.setup();
    const onTodayClick = vi.fn();
    const onMonthChange = vi.fn();
    render(
      <Calendar
        mode="single"
        today={TODAY}
        defaultMonth={new Date(2025, 0, 1)}
        onTodayClick={onTodayClick}
        onMonthChange={onMonthChange}
        fullWidth
      />
    );
    expect(screen.getByRole("grid")).toHaveAccessibleName(/January 2025/);

    await user.click(screen.getByRole("button", { name: /next month/i }));
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2025, 1, 1));
    await user.click(screen.getByRole("button", { name: /previous month/i }));

    await user.click(screen.getByRole("button", { name: "Hari ini" }));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 4, 1));
    expect(onTodayClick).toHaveBeenCalledWith(TODAY);
    expect(screen.getByRole("grid")).toHaveAccessibleName(/May 2026/);
  });

  it("lands on the latest enabled day and labels the button 'Bulan ini'", async () => {
    const user = userEvent.setup();
    const onTodayClick = vi.fn();
    render(
      <Calendar
        mode="single"
        today={TODAY}
        disabled={{ after: new Date(2026, 4, 13) }}
        numberOfMonths={2}
        onTodayClick={onTodayClick}
      />
    );
    await user.click(screen.getByRole("button", { name: "Bulan ini" }));
    expect(onTodayClick).toHaveBeenCalledWith(new Date(2026, 4, 13));
    // Two months on screen: today lands in the last one.
    expect(screen.getAllByRole("grid")[0]).toHaveAccessibleName(/April 2026/);
  });

  it("keeps 'Hari ini' when today itself is allowed, and stays on a controlled month", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(
      <Calendar
        mode="single"
        today={TODAY}
        month={new Date(2024, 0, 1)}
        onMonthChange={onMonthChange}
        disabled={{ before: new Date(2020, 0, 1) }}
      />
    );
    await user.click(screen.getByRole("button", { name: "Hari ini" }));
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 4, 1));
    expect(screen.getByRole("grid")).toHaveAccessibleName(/January 2024/);
  });

  it("uses a custom label, a custom footer, or no footer", () => {
    const { rerender } = render(<Calendar today={TODAY} todayLabel="Minggu ini" />);
    expect(screen.getByRole("button", { name: "Minggu ini" })).toBeInTheDocument();

    rerender(<Calendar today={TODAY} footer={<span>custom footer</span>} />);
    expect(screen.getByText("custom footer")).toBeInTheDocument();

    rerender(<Calendar today={TODAY} showTodayButton={false} />);
    expect(screen.queryByRole("button", { name: "Hari ini" })).not.toBeInTheDocument();
  });

  it("falls back to the WITA day when no today is given", () => {
    render(<Calendar />);
    expect(screen.getByRole("button", { name: "Hari ini" })).toBeInTheDocument();
  });
});

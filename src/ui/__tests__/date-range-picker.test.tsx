import { witaDateString, witaDateToLocalDate } from "@mono/utils";
import dayjs from "@mono/utils/dayjs";
import { act, fireEvent, render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateRangePicker, toMatchers, useMonthRangeSelection } from "../date-range-picker.js";

/** The calendar opens on the WITA month; the first grid is that month. */
const TODAY = witaDateToLocalDate(witaDateString());
const day = (n: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), n);

function dayButton(n: number, gridIndex = 0) {
  const grid = screen.getAllByRole("grid")[gridIndex] as HTMLElement;
  const cell = within(grid)
    .getAllByRole("gridcell")
    .find((c) => !c.hasAttribute("data-outside") && c.textContent === String(n));
  return cell?.querySelector("button") as HTMLElement;
}

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId("range"));
  await screen.findAllByRole("grid");
}

afterEach(() => {
  vi.doUnmock("../calendar.js");
  vi.resetModules();
});

describe("DateRangePicker label", () => {
  it("shows the placeholder, a single day or a full range", () => {
    const { rerender } = render(<DateRangePicker onChange={vi.fn()} testId="range" />);
    expect(screen.getByTestId("range")).toHaveTextContent("Pilih rentang tanggal");

    rerender(<DateRangePicker value={{ from: day(3) }} onChange={vi.fn()} testId="range" />);
    expect(screen.getByTestId("range")).toHaveTextContent(dayjs(day(3)).format("DD MMM YYYY"));

    rerender(
      <DateRangePicker value={{ from: day(3), to: day(9) }} onChange={vi.fn()} testId="range" />
    );
    expect(screen.getByTestId("range")).toHaveTextContent(
      `${dayjs(day(3)).format("DD MMM")} – ${dayjs(day(9)).format("DD MMM YYYY")}`
    );
  });

  it("clears the range from the trigger's X, unless not clearable", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <DateRangePicker value={{ from: day(3) }} onChange={onChange} testId="range" />
    );
    // The X is a span inside the trigger button, so it can't be a nested <button>.
    const clear = within(screen.getByTestId("range")).getAllByRole("button")[0] as HTMLElement;
    await user.click(clear);
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();

    rerender(
      <DateRangePicker
        value={{ from: day(3) }}
        onChange={onChange}
        clearable={false}
        testId="range"
      />
    );
    expect(within(screen.getByTestId("range")).queryByRole("button")).not.toBeInTheDocument();
  });
});

// userEvent-driven calendar flows run slowly when the whole suite shares the CPU.
describe("DateRangePicker modes", { timeout: 20_000 }, () => {
  it("passes the raw range through by default", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} testId="range" align="end" />);
    await open(user);
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    await user.click(dayButton(5));
    expect(onChange).toHaveBeenCalledWith({ from: day(5), to: day(5) });
  });

  it("snaps a fixed-length range and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} fixedRangeDays={6} testId="range" />);
    await open(user);
    await user.click(dayButton(5));
    expect(onChange).toHaveBeenCalledWith({ from: day(5), to: day(11) });
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("selects and previews whole weeks in week mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} snapToWeekday={3} testId="range" />);
    await open(user);

    fireEvent.mouseEnter(dayButton(15));
    const from = dayjs(day(15)).subtract((day(15).getDay() - 3 + 7) % 7, "day");
    expect(document.querySelectorAll(".bg-primary\\/10").length).toBeGreaterThan(0);
    fireEvent.mouseLeave(dayButton(15));
    expect(document.querySelectorAll(".bg-primary\\/10")).toHaveLength(0);

    await user.click(dayButton(15));
    expect(onChange).toHaveBeenCalledWith({
      from: from.toDate(),
      to: from.add(7, "day").toDate(),
    });
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();

    await open(user);
    await user.click(screen.getByRole("button", { name: "Minggu ini" }));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("keeps a within-month range inside the anchor's month", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        onChange={onChange}
        withinMonth
        disabled={{ dayOfWeek: [] }}
        defaultMonth={TODAY}
        testId="range"
      />
    );
    await open(user);
    expect(screen.getAllByRole("grid")).toHaveLength(1);

    // Moving the view without an anchor changes nothing.
    await user.click(screen.getByRole("button", { name: /next month/i }));
    await user.click(screen.getByRole("button", { name: /previous month/i }));

    // Second click before the anchor swaps the ends.
    await user.click(dayButton(20));
    // Jumping to the same month keeps the anchor.
    await user.click(screen.getByRole("button", { name: "Hari ini" }));
    await user.click(dayButton(4));
    expect(onChange).toHaveBeenCalledWith({ from: day(4), to: day(20) });
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();

    // Leaving the month drops the anchor: the next click anchors again.
    await open(user);
    await user.click(dayButton(4));
    await user.click(screen.getByRole("button", { name: /next month/i }));
    await user.click(screen.getByRole("button", { name: /previous month/i }));
    await user.click(dayButton(6));
    expect(onChange).toHaveBeenCalledTimes(1);
    await user.click(dayButton(9));
    expect(onChange).toHaveBeenLastCalledWith({ from: day(6), to: day(9) });

    // Closing with an anchor pending resets it.
    await open(user);
    await user.click(dayButton(4));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("ignores a selection without a clicked day in week and fixed modes", async () => {
    vi.doMock("../calendar.js", () => ({
      Calendar: ({ onSelect }: { onSelect: (range: unknown, day?: Date) => void }) => (
        <button type="button" onClick={() => onSelect(undefined, undefined)}>
          no day
        </button>
      ),
    }));
    vi.resetModules();
    const { DateRangePicker: Mocked } = await import("../date-range-picker.js");
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Mocked onChange={onChange} snapToWeekday={3} testId="range" />);
    await user.click(screen.getByTestId("range"));
    await user.click(await screen.findByText("no day"));

    rerender(<Mocked onChange={onChange} fixedRangeDays={3} testId="range" />);
    await user.click(screen.getByText("no day"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("useMonthRangeSelection", () => {
  it("ignores an empty day and resets on demand", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useMonthRangeSelection(onChange));
    act(() => {
      result.current.select(undefined);
    });
    expect(result.current.pending).toBeUndefined();
    act(() => {
      result.current.select(day(3));
    });
    expect(result.current.pending).toEqual({ from: day(3), to: undefined });
    expect(result.current.outsideMonth).toHaveLength(2);
    act(() => {
      result.current.reset();
    });
    expect(result.current.outsideMonth).toBeUndefined();
    act(() => {
      result.current.select(day(3));
    });
    act(() => {
      result.current.select(day(8));
    });
    expect(onChange).toHaveBeenCalledWith({ from: day(3), to: day(8) });
  });
});

describe("toMatchers", () => {
  it("flattens matchers and drops undefined", () => {
    const a = new Date(2026, 0, 1);
    const b = { before: a };
    expect(toMatchers(undefined, a, [b])).toEqual([a, b]);
  });
});

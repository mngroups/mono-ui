import { witaDateString } from "@mono/utils";
import dayjs from "@mono/utils/dayjs";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DatePickerBase, FormDatePicker } from "../date-picker.js";

const mobile = vi.hoisted(() => ({ value: false }));
vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => mobile.value,
}));

beforeEach(() => {
  mobile.value = false;
});

/** The calendar opens on the WITA month, so the tests pick days inside it. */
const TODAY = witaDateString();
const OTHER_DAY = TODAY.endsWith("-01") ? 2 : 1;

function dayButton(grid: HTMLElement, day: number) {
  const cell = within(grid)
    .getAllByRole("gridcell")
    .find((c) => !c.hasAttribute("data-outside") && c.textContent === String(day));
  return cell?.querySelector("button") as HTMLElement;
}

function Harness({ error }: { error?: string }) {
  const form = useForm<{ tanggal: string }>({ defaultValues: { tanggal: "" } });
  useEffect(() => {
    if (error) form.setError("tanggal", { message: error });
  }, [error, form]);
  return <FormDatePicker control={form.control} name="tanggal" placeholder="Tanggal" />;
}

describe("FormDatePicker", () => {
  it("shows the field's validation message", async () => {
    render(<Harness error="Tanggal selesai tidak boleh sebelum tanggal mulai" />);
    expect(
      await screen.findByText("Tanggal selesai tidak boleh sebelum tanggal mulai")
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows no message while the field is valid", () => {
    render(<Harness />);
    expect(screen.getByText("Tanggal")).toBeInTheDocument();
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-invalid");
  });
});

describe("DatePickerBase", () => {
  it("picks a day from the desktop popover", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePickerBase
        value={TODAY}
        onChange={onChange}
        label="Tanggal mulai"
        testId="date-trigger"
      />
    );
    expect(screen.getByText("Tanggal mulai")).toBeInTheDocument();
    const trigger = screen.getByTestId("date-trigger");
    expect(trigger).toHaveTextContent(dayjs(TODAY).format("DD MMM YYYY"));

    await user.click(trigger);
    expect(trigger).toHaveClass("border-primary");
    const grid = await screen.findByRole("grid");
    await user.click(dayButton(grid, OTHER_DAY));
    expect(onChange).toHaveBeenCalledWith(
      `${TODAY.slice(0, 8)}${String(OTHER_DAY).padStart(2, "0")}`
    );
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("opens on the selected date's month, not today's", async () => {
    const user = userEvent.setup();
    render(<DatePickerBase value="2024-03-10" onChange={vi.fn()} testId="t" />);
    await user.click(screen.getByTestId("t"));
    const grid = await screen.findByRole("grid");
    expect(dayButton(grid, 10)?.closest("td")).toHaveAttribute("data-selected", "true");
  });

  it("clears the value when the selected day is clicked again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePickerBase value={TODAY} onChange={onChange} testId="t" />);
    await user.click(screen.getByTestId("t"));
    const grid = await screen.findByRole("grid");
    await user.click(dayButton(grid, Number(TODAY.slice(8))));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows the placeholder for an invalid value and disables past days", async () => {
    const user = userEvent.setup();
    render(<DatePickerBase value="not-a-date" onChange={vi.fn()} disablePast testId="t" />);
    expect(screen.getByTestId("t")).toHaveTextContent("Pilih tanggal");
    await user.click(screen.getByTestId("t"));
    await user.click(await screen.findByRole("button", { name: /previous month/i }));
    const days = within(screen.getByRole("grid")).getAllByRole("gridcell");
    expect(days.some((cell) => cell.hasAttribute("data-disabled"))).toBe(true);
  });

  it("opens a bottom sheet on mobile", async () => {
    mobile.value = true;
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePickerBase onChange={onChange} placeholder="Pilih hari" testId="t" />);
    await user.click(screen.getByTestId("t"));
    const grid = await screen.findByRole("grid");
    expect(screen.getAllByText("Pilih hari").length).toBeGreaterThan(1);
    // vaul's drawer drag handler needs pointer capture jsdom lacks; a plain click is enough here.
    fireEvent.click(within(grid).getAllByRole("button", { name: /15th/ })[0] as HTMLElement);
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-15$/));
  });
});

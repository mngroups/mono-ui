import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { type DateRange, DateRangePicker } from "./date-range-picker.js";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};

const meta = {
  title: "Components/DateRangePicker",
  component: DateRangePicker,
  parameters: {
    docs: { importPath: 'import { DateRangePicker, type DateRange } from "@mono/ui";' },
  },
  args: {
    placeholder: "Pilih rentang tanggal",
    clearable: true,
    withinMonth: false,
    align: "start",
    onChange: fn(),
  },
  argTypes: {
    placeholder: { control: "text" },
    clearable: { control: "boolean" },
    withinMonth: { control: "boolean" },
    fixedRangeDays: { control: "number" },
    snapToWeekday: { control: { type: "number", min: 0, max: 6 } },
    align: { control: "select", options: ["start", "center", "end"] },
  },
  render: function Render(args) {
    const [range, setRange] = useState<DateRange | undefined>(args.value);
    return (
      <DateRangePicker
        {...args}
        value={range}
        onChange={(next) => {
          setRange(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A picked range shows in the trigger; the × clears it when `clearable` is on. */
export const WithValue: Story = {
  args: { value: { from: daysAgo(7), to: daysAgo(1) } },
};

/** Production reports run up to H-1: block today and the future with `disabled`. */
export const DisabledFuture: Story = {
  args: { disabled: { after: daysAgo(1) }, defaultMonth: daysAgo(30) },
};

/** `fixedRangeDays` locks the length: one click picks the start, the end is snapped. */
export const FixedLength: Story = {
  args: { fixedRangeDays: 6, placeholder: "Pilih periode 7 hari" },
};

/** `snapToWeekday={3}` selects the Wednesday-to-Wednesday week around the clicked day. */
export const WeeklySelect: Story = {
  args: { snapToWeekday: 3, placeholder: "Pilih minggu" },
};

/** `withinMonth` shows one month and keeps both ends inside it, for monthly fuel recaps. */
export const WithinMonth: Story = {
  args: { withinMonth: true, placeholder: "Pilih rentang dalam satu bulan" },
};

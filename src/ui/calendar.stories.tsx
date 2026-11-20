import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "./calendar.js";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    docs: { importPath: 'import { Calendar } from "@mono/ui";' },
  },
  args: { showTodayButton: true, fullWidth: false, showOutsideDays: true },
  argTypes: {
    showTodayButton: { control: "boolean" },
    todayLabel: { control: "text" },
    fullWidth: { control: "boolean" },
    showOutsideDays: { control: "boolean" },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<Date | undefined>(new Date());
    return (
      <div className="w-fit rounded-xl border">
        <Calendar {...args} mode="single" selected={selected} onSelect={setSelected} />
      </div>
    );
  },
};

/** `mode="range"` with two months side by side, as `DateRangePicker` uses it. */
export const Range: Story = {
  render: function Render(args) {
    const [range, setRange] = useState<DateRange | undefined>({
      from: daysAgo(10),
      to: daysAgo(3),
    });
    return (
      <div className="w-fit rounded-xl border">
        <Calendar {...args} mode="range" numberOfMonths={2} selected={range} onSelect={setRange} />
      </div>
    );
  },
};

/** Reports are capped at H-1: future days and today are disabled, so the footer reads "Bulan ini". */
export const DisabledDays: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<Date | undefined>(daysAgo(1));
    return (
      <div className="w-fit rounded-xl border">
        <Calendar
          {...args}
          mode="single"
          selected={selected}
          onSelect={setSelected}
          disabled={{ after: daysAgo(1) }}
          onTodayClick={setSelected}
        />
      </div>
    );
  },
};

/** `mode="multiple"` for picking several separate days, e.g. unit service days. */
export const Multiple: Story = {
  render: function Render(args) {
    const [days, setDays] = useState<Date[] | undefined>([daysAgo(2), daysAgo(5), daysAgo(9)]);
    return (
      <div className="w-fit rounded-xl border">
        <Calendar {...args} mode="multiple" selected={days} onSelect={setDays} />
      </div>
    );
  },
};

/** `fullWidth` stretches the grid to its container, for full-width mobile sheets. */
export const FullWidth: Story = {
  args: { fullWidth: true },
  render: function Render(args) {
    const [selected, setSelected] = useState<Date | undefined>(new Date());
    return (
      <div className="w-full max-w-md rounded-xl border">
        <Calendar {...args} mode="single" selected={selected} onSelect={setSelected} />
      </div>
    );
  },
};

/** A custom footer label for weekly pickers, or `showTodayButton={false}` to hide the footer. */
export const TodayButton: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <div className="w-fit rounded-xl border">
        <Calendar mode="single" todayLabel="Minggu ini" />
      </div>
      <div className="w-fit rounded-xl border">
        <Calendar mode="single" showTodayButton={false} />
      </div>
    </div>
  ),
};

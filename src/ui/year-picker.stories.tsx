import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { mobileStory } from "../../.storybook/docs/mobile";
import { YearPicker } from "./year-picker.js";

const thisYear = new Date().getFullYear();

const meta = {
  title: "Components/YearPicker",
  component: YearPicker,
  parameters: {
    docs: { importPath: 'import { YearPicker } from "@mono/ui";' },
  },
  args: {
    year: thisYear,
    onSelectYear: fn(),
    align: "start",
    title: "Pilih tahun",
  },
  argTypes: {
    year: { control: "number" },
    minYear: { control: "number" },
    maxYear: { control: "number" },
    align: { control: "select", options: ["start", "center", "end"] },
    sideOffset: { control: "number" },
    title: { control: "text" },
  },
  render: function Render(args) {
    const [year, setYear] = useState(args.year);
    return (
      <YearPicker
        {...args}
        year={year}
        onSelectYear={(next) => {
          setYear(next);
          args.onSelectYear(next);
        }}
      />
    );
  },
} satisfies Meta<typeof YearPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `minYear` and `maxYear` bound the grid, e.g. to the years a site has production data. */
export const Bounded: Story = {
  args: { minYear: thisYear - 4, maxYear: thisYear },
};

/** In a page header: the trigger sits next to the title and filters the yearly recap. */
export const InHeader: Story = {
  render: function Render(args) {
    const [year, setYear] = useState(args.year);
    return (
      <div className="flex w-full max-w-lg items-center justify-between gap-4 rounded-xl border p-4">
        <div>
          <p className="font-semibold">Rekap produksi tahunan</p>
          <p className="text-sm text-muted-foreground">Site Pit Utara · {year}</p>
        </div>
        <YearPicker {...args} year={year} onSelectYear={setYear} align="end" />
      </div>
    );
  },
};

/** Below `md`, the 12-year grid opens in a bottom sheet titled by `title`. */
export const Mobile: Story = {
  ...mobileStory,
};

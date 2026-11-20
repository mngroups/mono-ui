import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { DateRangeFilterControl } from "./filter-sections.js";

const meta = {
  title: "Components/DateRangeFilterControl",
  component: DateRangeFilterControl,
  parameters: {
    docs: { importPath: 'import { DateRangeFilterControl } from "@mono/ui";' },
  },
  args: { value: undefined, onChange: fn(), fullWidth: false },
  argTypes: {
    label: { control: "text" },
    fullWidth: { control: "boolean" },
    value: { control: false },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <DateRangeFilterControl
        {...args}
        value={value}
        onChange={(range) => {
          setValue(range);
          args.onChange(range);
        }}
      />
    );
  },
} satisfies Meta<typeof DateRangeFilterControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** With a range set, the trigger shows it and turns active. */
export const WithRange: Story = {
  args: { value: { from: new Date(2026, 10, 1), to: new Date(2026, 10, 15) } },
};

export const CustomLabel: Story = {
  args: { label: "Tanggal pengisian" },
};

/** Default `fullWidth` fills a cell of the mobile filter sheet's two-column grid. */
export const InFilterGrid: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div className="grid max-w-sm grid-cols-2 gap-2">
        <Story />
      </div>
    ),
  ],
};

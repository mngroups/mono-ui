import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { Pagination } from "./pagination.js";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    docs: { importPath: 'import { Pagination } from "@mono/ui";' },
  },
  args: { total: 230, current: 1, pageSize: 10, onChange: fn() },
  argTypes: {
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const [page, setPage] = useState(args.current ?? 1);
    return (
      <Pagination
        {...args}
        current={page}
        onChange={(next) => {
          setPage(next);
          args.onChange?.(next);
        }}
      />
    );
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** In the middle of a long list the 5-page window slides; the `…` buttons jump 5 pages (hover them). */
export const ManyPages: Story = {
  args: { total: 24_312, current: 1_200 },
};

/** Page numbers use Indonesian grouping, and the buttons grow so 4–5 digit pages fit. */
export const LargePageNumbers: Story = {
  args: { total: 243_120, pageSize: 10, current: 24_310 },
};

export const FewPages: Story = {
  args: { total: 34 },
};

/** Disable while the next page is loading so clicks don't queue up. */
export const Disabled: Story = {
  args: { current: 3, disabled: true },
};

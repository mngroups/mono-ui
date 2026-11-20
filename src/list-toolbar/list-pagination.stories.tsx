import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { mobileStory } from "../../.storybook/docs/mobile";
import { ListPagination } from "./list-toolbar.js";

const meta = {
  title: "Components/ListPagination",
  component: ListPagination,
  parameters: {
    docs: { importPath: 'import { ListPagination } from "@mono/ui";' },
  },
  args: { total: 230, page: 1, pageSize: 10, onChange: fn() },
  argTypes: {
    showJumper: { control: "boolean" },
  },
  render: function Render(args) {
    const [page, setPage] = useState(args.page);
    return (
      <ListPagination
        {...args}
        page={page}
        onChange={(next) => {
          setPage(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof ListPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `showJumper` adds a "go to page" input on desktop; type a page and press Enter. */
export const WithJumper: Story = {
  args: { total: 24_312, page: 120, showJumper: true },
};

/** Under a table: the same row the list pages use. */
export const UnderList: Story = {
  args: { total: 23, pageSize: 5 },
  render: function Render(args) {
    const [page, setPage] = useState(1);
    const rows = Array.from({ length: args.total }, (_, i) => ({
      id: `U-${String(i + 1).padStart(3, "0")}`,
      site: ["Site Bontang", "Site Sangatta", "Site Kideco"][i % 3],
      fuel: 1_000 + i * 37,
    })).slice((page - 1) * args.pageSize, page * args.pageSize);
    return (
      <div className="max-w-lg space-y-4 rounded-xl border border-foreground/10 p-4">
        <ul className="divide-y divide-foreground/10 text-sm">
          {rows.map((row) => (
            <li key={row.id} className="flex justify-between py-2">
              <span>
                {row.id} · {row.site}
              </span>
              <span className="tabular-nums">{row.fuel.toLocaleString("id-ID")} L</span>
            </li>
          ))}
        </ul>
        <ListPagination {...args} page={page} onChange={setPage} />
      </div>
    );
  },
};

/** Everything fits on one page: nothing is rendered. */
export const SinglePage: Story = {
  args: { total: 8 },
  render: (args) => (
    <div className="space-y-2">
      <p className="text-sm text-foreground/60">8 data, 1 halaman: pager tidak ditampilkan.</p>
      <ListPagination {...args} />
    </div>
  ),
};

/** Below `md` the row becomes Previous / page input / Next, with a jumper always on. */
export const Mobile: Story = {
  ...mobileStory,
  args: { total: 24_312, page: 12 },
};

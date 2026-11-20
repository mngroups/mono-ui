import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../ui/button.js";
import { TableSkeleton } from "./table-skeleton.js";

const meta = {
  title: "Components/TableSkeleton",
  component: TableSkeleton,
  parameters: {
    docs: { importPath: 'import { TableSkeleton } from "@mono/ui";' },
  },
  args: { rows: 5 },
  argTypes: { rows: { control: { type: "number", min: 1, max: 20 } } },
} satisfies Meta<typeof TableSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Leave `rows` out to get 10, the default page size. */
export const DefaultPageSize: Story = {
  args: { rows: undefined },
};

const rows = [
  { unit: "HD-785-07", ton: "1.240" },
  { unit: "HD-785-12", ton: "1.180" },
  { unit: "PC-2000-03", ton: "960" },
];

/** Swap the skeleton for the real rows; the area keeps its height. */
export const LoadingThenData: Story = {
  render: function Render(args) {
    const [loading, setLoading] = useState(true);
    return (
      <div className="max-w-lg space-y-3">
        <Button variant="outline" size="sm" onClick={() => setLoading((v) => !v)}>
          {loading ? "Tampilkan data" : "Muat ulang"}
        </Button>
        {loading ? (
          <TableSkeleton {...args} rows={3} />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.unit}
                className="flex h-12 items-center justify-between rounded-xl border px-4 text-sm"
              >
                <span className="font-medium">{row.unit}</span>
                <span className="text-muted-foreground">{row.ton} ton</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
};

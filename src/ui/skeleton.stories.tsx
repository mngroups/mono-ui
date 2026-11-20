import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton.js";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    docs: { importPath: 'import { Skeleton } from "@mono/ui";' },
  },
  args: { className: "h-4 w-48" },
  argTypes: {
    variant: { control: "select", options: ["text", "rectangular", "circular"] },
    className: { control: "text" },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Size and shape come only from `className`; `circular` keeps it round. */
export const Shapes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Skeleton className="h-4 w-32 rounded" />
      <Skeleton className="h-16 w-28 rounded-lg" />
      <Skeleton variant="circular" className="size-10" />
    </div>
  ),
};

/** Mirror the real layout so nothing shifts when data lands (house rule: no "Loading…" text). */
export const CardPlaceholder: Story = {
  render: () => (
    <div className="w-72 space-y-4 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="size-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <Skeleton className="h-8 w-28 rounded" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  ),
};

/** KPI tiles while their numbers load. */
export const KpiRow: Story = {
  render: () => (
    <div className="grid max-w-2xl grid-cols-3 gap-3">
      {["produksi", "fuel", "unit"].map((key) => (
        <div key={key} className="space-y-2 rounded-xl border p-4">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-7 w-24 rounded" />
        </div>
      ))}
    </div>
  ),
};

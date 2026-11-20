import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { StatusLabel } from "../status-label/status-label.js";
import { MobileCardList } from "./mobile-card-list.js";
import { CardSummary, MobileDataCard } from "./mobile-data-card.js";

type Unit = { id: string; unit: string; site: string; fuel: number; aktif: boolean };

const SITES = ["Site Bengalon", "Site Sangatta", "Site Lati", "Site Kintap"];
const UNITS: Unit[] = Array.from({ length: 12 }, (_, i) => ({
  id: `unit-${i + 1}`,
  unit: `HD785-${String(10 + i)}`,
  site: SITES[i % SITES.length],
  fuel: 900 + i * 85,
  aktif: i % 4 !== 3,
}));

const renderCard = (item: Unit) => (
  <MobileDataCard
    header={
      <CardSummary
        title={item.unit}
        subtitle={item.site}
        badge={
          <StatusLabel tone={item.aktif ? "success" : "default"}>
            {item.aktif ? "Aktif" : "Standby"}
          </StatusLabel>
        }
      />
    }
    rows={[
      { label: "Fuel hari ini", value: `${item.fuel.toLocaleString("id-ID")} L` },
      { label: "Site", value: item.site },
    ]}
  />
);

const meta = {
  title: "Components/MobileCardList",
  component: MobileCardList<Unit>,
  parameters: {
    docs: { importPath: 'import { MobileCardList, MobileDataCard } from "@mono/ui";' },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    items: UNITS.slice(0, 3),
    renderCard,
    keyOf: (item) => item.id,
  },
  argTypes: {
    isLoading: { control: "boolean" },
    skeletonCount: { control: "number" },
    items: { control: false },
  },
} satisfies Meta<typeof MobileCardList<Unit>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `clientSide: true` slices `items` itself; without it, pass the current page only. */
export const ClientPagination: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(1);
    return (
      <MobileCardList<Unit>
        {...args}
        items={UNITS}
        pagination={{ total: UNITS.length, page, pageSize: 4, onChange: setPage, clientSide: true }}
      />
    );
  },
};

/** `header` sits above the first card, e.g. a result count. */
export const WithHeader: Story = {
  args: {
    header: <p className="text-xs text-foreground/50">3 dari 12 unit</p>,
  },
};

export const Loading: Story = {
  args: { isLoading: true, skeletonCount: 4 },
};

/** No items renders the shared `EmptyData` state. */
export const Empty: Story = {
  args: { items: [] },
};

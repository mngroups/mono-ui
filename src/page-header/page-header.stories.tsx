import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays, Download, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { fn } from "storybook/test";

import { mobileStory } from "../../.storybook/docs/mobile";
import { Button } from "../ui/button.js";
import { PageHeader } from "./page-header.js";

/** Stand-in for a router link such as `next/link`. */
function RouterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} data-router-link>
      {children}
    </a>
  );
}

const meta = {
  title: "Components/PageHeader",
  component: PageHeader,
  parameters: {
    docs: { importPath: 'import { PageHeader } from "@mono/ui";' },
  },
  args: {
    title: "Fuel",
    subtitle: "Ringkasan harian",
    actions: [{ label: "Tambah", icon: <Plus size={16} />, onClick: fn(), variant: "primary" }],
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Sub-pages get a back button; `linkComponent` renders `back.href` with your router's link. */
export const WithBack: Story = {
  args: {
    title: "Detail transaksi fuel",
    subtitle: "FL-2026-11-0042 · Site Bontang",
    back: { href: "#fuel" },
    linkComponent: RouterLink,
    actions: [],
  },
};

/** Two or more actions: inline on desktop, a two-column grid under the title on mobile. */
export const MultipleActions: Story = {
  args: {
    title: "Kontraktor",
    subtitle: "24 kontraktor aktif",
    actions: [
      { label: "Unduh", icon: <Download size={16} />, onClick: fn(), mobile: "full" },
      {
        label: "Tambah kontraktor",
        icon: <Plus size={16} />,
        onClick: fn(),
        variant: "primary",
        mobile: "full",
      },
    ],
  },
};

/** `hidden` actions are removed (e.g. missing permission); `disabled` ones stay visible. */
export const HiddenAndDisabledActions: Story = {
  args: {
    title: "Unit",
    actions: [
      { label: "Hapus", onClick: fn(), hidden: true },
      { label: "Sinkronkan", onClick: fn(), disabled: true },
      { label: "Tambah unit", onClick: fn(), variant: "primary" },
    ],
  },
};

/** `children` is a free trailing slot (date pills, custom controls) placed before the actions. */
export const WithTrailingSlot: Story = {
  args: {
    title: "Produksi",
    subtitle: "Ton per shift",
    children: (
      <Button type="button" variant="outline" className="gap-1.5">
        <CalendarDays size={16} /> 1–20 Nov 2026
      </Button>
    ),
  },
};

/** At 360px a single action collapses to its icon; extra rows stack under the title. */
export const Mobile: Story = {
  ...mobileStory,
  args: {
    ...MultipleActions.args,
    back: { href: "#kontraktor" },
    linkComponent: RouterLink,
  },
  render: (args) => (
    <div className="space-y-8">
      <PageHeader
        title="Fuel"
        subtitle="Ringkasan harian"
        actions={[
          { label: "Tambah", icon: <Plus size={16} />, onClick: () => {}, variant: "primary" },
        ]}
      />
      <PageHeader {...args} />
    </div>
  ),
};

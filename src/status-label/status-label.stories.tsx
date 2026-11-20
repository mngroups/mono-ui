import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheck, Clock, TriangleAlert, XCircle } from "lucide-react";

import { StatusLabel } from "./status-label.js";

const meta = {
  title: "Components/StatusLabel",
  component: StatusLabel,
  parameters: {
    docs: { importPath: 'import { StatusLabel } from "@mono/ui";' },
  },
  args: { tone: "success", children: "Aktif" },
  argTypes: {
    tone: { control: "select", options: ["default", "success", "danger", "info", "warning"] },
    children: { control: "text" },
  },
} satisfies Meta<typeof StatusLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One tone per meaning: neutral, done/ok, rejected/failed, in progress, needs attention. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusLabel {...args} tone="default">
        Draft
      </StatusLabel>
      <StatusLabel {...args} tone="success">
        Disetujui
      </StatusLabel>
      <StatusLabel {...args} tone="danger">
        Ditolak
      </StatusLabel>
      <StatusLabel {...args} tone="info">
        Diproses
      </StatusLabel>
      <StatusLabel {...args} tone="warning">
        Menunggu
      </StatusLabel>
    </div>
  ),
};

/** `icon` sits before the text; a 12px lucide icon fits the pill. */
export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusLabel {...args} tone="success" icon={<CircleCheck />}>
        Selesai
      </StatusLabel>
      <StatusLabel {...args} tone="warning" icon={<Clock />}>
        Menunggu approval
      </StatusLabel>
      <StatusLabel {...args} tone="danger" icon={<XCircle />}>
        Ditolak
      </StatusLabel>
      <StatusLabel {...args} tone="info" icon={<TriangleAlert />}>
        Perlu cek ulang
      </StatusLabel>
    </div>
  ),
};

const units = [
  { code: "HD-785-07", site: "Site Batu Hijau", status: "Beroperasi", tone: "success" },
  { code: "PC-2000-03", site: "Site Sangatta", status: "Breakdown", tone: "danger" },
  { code: "D375A-11", site: "Site Tabang", status: "Standby", tone: "warning" },
  { code: "GD-825-02", site: "Site Melak", status: "Servis", tone: "info" },
] as const;

/** Typical use: the status column of a list. */
export const InAList: Story = {
  render: (args) => (
    <ul className="max-w-md divide-y rounded-xl border">
      {units.map((unit) => (
        <li key={unit.code} className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-medium">{unit.code}</p>
            <p className="text-xs text-muted-foreground">{unit.site}</p>
          </div>
          <StatusLabel {...args} tone={unit.tone}>
            {unit.status}
          </StatusLabel>
        </li>
      ))}
    </ul>
  ),
};

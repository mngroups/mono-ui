import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fuel, Truck } from "lucide-react";

import { Badge } from "./badge.js";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: { importPath: 'import { Badge } from "@mono/ui";' },
  },
  args: { children: "Baru" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "success",
        "danger",
        "warning",
        "info",
        "neutral",
      ],
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The shadcn variants, for counts, categories and tags. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args}>Baru</Badge>
      <Badge {...args} variant="secondary">
        Kontraktor
      </Badge>
      <Badge {...args} variant="outline">
        Site Sangatta
      </Badge>
      <Badge {...args} variant="destructive">
        Overdue
      </Badge>
    </div>
  ),
};

/** Tinted tones shared with `StatusLabel`; prefer `StatusLabel` for record status. */
export const StatusTones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} variant="success">
        Sesuai target
      </Badge>
      <Badge {...args} variant="warning">
        Mendekati batas
      </Badge>
      <Badge {...args} variant="danger">
        Melebihi kuota
      </Badge>
      <Badge {...args} variant="info">
        Estimasi
      </Badge>
      <Badge {...args} variant="neutral">
        Tidak aktif
      </Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} variant="secondary">
        <Truck /> 24 unit
      </Badge>
      <Badge {...args} variant="outline">
        <Fuel /> 1.250 L
      </Badge>
    </div>
  ),
};

/** `asChild` styles a link as a badge; it gets a hover state. */
export const AsLink: Story = {
  args: { asChild: true },
  render: (args) => (
    <Badge {...args}>
      <a href="#kontraktor">PT Bara Jaya</a>
    </Badge>
  ),
};

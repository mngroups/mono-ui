import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Plus, Trash2 } from "lucide-react";

import { Button } from "./button.js";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: { importPath: 'import { Button } from "@mono/ui";' },
  },
  args: { children: "Simpan" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "link", "destructive"],
    },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Use one `default` button per area for the main action; the others for the rest. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>Simpan</Button>
      <Button {...args} variant="secondary">
        Draft
      </Button>
      <Button {...args} variant="outline">
        Batal
      </Button>
      <Button {...args} variant="ghost">
        Lewati
      </Button>
      <Button {...args} variant="link">
        Lihat detail
      </Button>
      <Button {...args} variant="destructive">
        Hapus
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm">
        Kecil
      </Button>
      <Button {...args}>Default</Button>
      <Button {...args} size="lg">
        Besar
      </Button>
      <Button {...args} size="icon" aria-label="Tambah">
        <Plus />
      </Button>
    </div>
  ),
};

/** Icons placed as children get sized and spaced automatically. */
export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <Plus /> Tambah data
      </Button>
      <Button {...args} variant="outline">
        <Download /> Unduh
      </Button>
      <Button {...args} variant="destructive">
        <Trash2 /> Hapus
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** `asChild` passes the styles to the child, e.g. a router link. */
export const AsLink: Story = {
  args: { asChild: true },
  render: (args) => (
    <Button {...args}>
      <a href="#fuel">Buka halaman Fuel</a>
    </Button>
  ),
};

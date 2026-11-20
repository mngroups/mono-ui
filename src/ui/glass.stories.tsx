import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fuel, MapPin, Truck } from "lucide-react";

import { Button } from "./button.js";
import { GLASS_PANEL_STYLE } from "./glass.js";

/** Busy backdrop so the blur is visible. */
function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#0097b2,#34d399_45%,#f59e0b)] p-8">
      <div className="absolute top-6 left-10 size-24 rounded-full bg-white/50" />
      <div className="absolute right-12 bottom-6 size-32 rounded-full bg-slate-900/40" />
      {children}
    </div>
  );
}

const meta = {
  title: "Components/GlassPanel",
  parameters: {
    docs: {
      importPath: 'import { GLASS_PANEL_STYLE } from "@mono/ui";',
      description: {
        component:
          "`GLASS_PANEL_STYLE` is a style object (not a component) for a frosted panel: translucent background, 16px backdrop blur, hairline border and shadow. It reads the `--glass-bg`, `--glass-border` and `--glass-shadow` tokens from `styles.css`, so it follows light/dark mode. Apply it with `style={GLASS_PANEL_STYLE}` and add radius and padding with classes. Use it for panels floating over a map or chart.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Backdrop>
      <div style={GLASS_PANEL_STYLE} className="relative w-72 rounded-2xl p-4">
        <p className="text-sm font-semibold">Site Sangatta</p>
        <p className="text-xs text-muted-foreground">Produksi hari ini</p>
        <p className="mt-2 text-2xl font-bold">4.120 ton</p>
      </div>
    </Backdrop>
  ),
};

/** Floating map card: a typical use over a map layer. */
export const MapOverlay: Story = {
  render: () => (
    <Backdrop>
      <div style={GLASS_PANEL_STYLE} className="relative w-80 space-y-3 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <p className="text-sm font-semibold">Pit Utara, Site Tabang</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-muted-foreground" /> 18 unit
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="size-4 text-muted-foreground" /> 2.640 L
          </div>
        </div>
        <Button size="sm" className="w-full">
          Lihat detail
        </Button>
      </div>
    </Backdrop>
  ),
};

/** A slim floating toolbar. */
export const Toolbar: Story = {
  render: () => (
    <Backdrop>
      <div style={GLASS_PANEL_STYLE} className="relative flex gap-1 rounded-full p-1.5">
        <Button size="sm" variant="ghost" className="rounded-full">
          Hari ini
        </Button>
        <Button size="sm" className="rounded-full">
          Minggu ini
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full">
          Bulan ini
        </Button>
      </div>
    </Backdrop>
  ),
};

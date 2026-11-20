import type { Meta, StoryObj } from "@storybook/react-vite";

import { mobileStory } from "../../.storybook/docs/mobile";
import { StickyFormFooter } from "../sticky-form-footer/sticky-form-footer.js";
import { Button } from "../ui/button.js";
import { Input } from "../ui/input.js";
import { UiConfigProvider, useUiConfig } from "./ui-config.js";

/** Reads the config like the library components do. */
function ConfigReadout() {
  const { mobileNavV2 } = useUiConfig();
  return (
    <p className="text-sm">
      <code className="rounded bg-muted px-1.5 py-0.5">useUiConfig().mobileNavV2</code> ={" "}
      <strong>{String(mobileNavV2)}</strong>
    </p>
  );
}

function FuelForm() {
  return (
    <form className="max-w-md space-y-3" onSubmit={(e) => e.preventDefault()}>
      <ConfigReadout />
      <Input placeholder="Kode unit, mis. HD-785-07" />
      <Input placeholder="Jumlah fuel (L)" inputMode="numeric" />
      <StickyFormFooter className="flex justify-end gap-2">
        <Button variant="outline" type="button">
          Batal
        </Button>
        <Button type="submit">Simpan</Button>
      </StickyFormFooter>
    </form>
  );
}

const meta = {
  title: "Components/UiConfigProvider",
  component: UiConfigProvider,
  parameters: {
    docs: {
      importPath: 'import { UiConfigProvider, useUiConfig } from "@mono/ui";',
      description: {
        component:
          "Wrap the app once, near the root, and wire `mobileNavV2` to your feature flag. When on, `DynamicModal` pins its header and footer on phones and `StickyFormFooter` pins form actions above the bottom navigation; when off, both render exactly as before. Each of those components also takes its own `mobileNavV2` prop, which wins over the provider. Read the values in your own components with `useUiConfig()`. Without a provider every switch is `false`.",
      },
    },
  },
  args: { mobileNavV2: false, children: null },
  argTypes: { children: { control: false } },
  render: (args) => (
    <UiConfigProvider {...args}>
      <FuelForm />
    </UiConfigProvider>
  ),
} satisfies Meta<typeof UiConfigProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Toggle `mobileNavV2` in Controls; on desktop the footer row looks the same either way. */
export const Default: Story = {};

/** At 360px with `mobileNavV2` on, the form actions are pinned full-width at the bottom. */
export const MobileNavV2On: Story = {
  ...mobileStory,
  args: { mobileNavV2: true },
};

/** Same form at 360px with the switch off: the actions stay an inline row. */
export const MobileNavV2Off: Story = {
  ...mobileStory,
  args: { mobileNavV2: false },
};

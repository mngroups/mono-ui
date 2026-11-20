import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Label } from "./label.js";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select.js";

const sites = [
  { value: "batu-hijau", label: "Site Batu Hijau" },
  { value: "sangatta", label: "Site Sangatta" },
  { value: "kideco", label: "Site Kideco" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    docs: {
      importPath:
        'import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@mono/ui";',
    },
  },
  args: { disabled: false },
  argTypes: {
    disabled: { control: "boolean" },
    defaultValue: { control: "select", options: [undefined, ...sites.map((s) => s.value)] },
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-56" aria-label="Site">
        <SelectValue placeholder="Pilih site" />
      </SelectTrigger>
      <SelectContent>
        {sites.map((site) => (
          <SelectItem key={site.value} value={site.value}>
            {site.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Rendered open with `defaultOpen`. It runs in its own frame because an open select locks
 * scrolling on the page around it.
 */
export const Open: Story = {
  args: { defaultOpen: true, defaultValue: "sangatta" },
  parameters: { docs: { story: { inline: false, iframeHeight: 260 } } },
};

/** Group options with `SelectGroup` + `SelectLabel` and split groups with `SelectSeparator`. */
export const Grouped: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-64" aria-label="Unit">
        <SelectValue placeholder="Pilih unit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Hauling</SelectLabel>
          <SelectItem value="hd-785-07">HD-785-07</SelectItem>
          <SelectItem value="hd-785-12">HD-785-12</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Loading</SelectLabel>
          <SelectItem value="pc-2000-03">PC-2000-03</SelectItem>
          <SelectItem value="pc-1250-01" disabled>
            PC-1250-01 (servis)
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

/** `SelectTrigger` takes `size="sm"` for dense toolbars and tables. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(["sm", "default"] as const).map((size) => (
        <Select {...args} key={size} defaultValue="kideco">
          <SelectTrigger size={size} className="w-48" aria-label={`Site ${size}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
              <SelectItem key={site.value} value={site.value}>
                {site.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  ),
};

/** Controlled with `value` + `onValueChange`, with a `Label` pointing at the trigger. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("batu-hijau");
    return (
      <div className="grid max-w-xs gap-2">
        <Label htmlFor="site-select">Site</Label>
        <Select {...args} value={value} onValueChange={setValue}>
          <SelectTrigger id="site-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
              <SelectItem key={site.value} value={site.value}>
                {site.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">Nilai: {value}</p>
      </div>
    );
  },
};

/** `aria-invalid` on the trigger shows the error style. */
export const Invalid: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-56" aria-label="Site" aria-invalid>
        <SelectValue placeholder="Pilih site" />
      </SelectTrigger>
      <SelectContent>
        {sites.map((site) => (
          <SelectItem key={site.value} value={site.value}>
            {site.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "sangatta" },
};

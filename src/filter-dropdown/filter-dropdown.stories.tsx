import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn, userEvent, within } from "storybook/test";

import { mobileStory } from "../../.storybook/docs/mobile";
import {
  type FilterDropdownOption,
  MultiSelectDropdown,
  MultiSelectOptionDropdown,
  SingleSelectOptionDropdown,
} from "./filter-dropdown.js";

const SITE_OPTIONS: FilterDropdownOption[] = [
  { value: "bengalon", label: "Site Bengalon" },
  { value: "sangatta", label: "Site Sangatta" },
  { value: "lati", label: "Site Lati" },
  { value: "binungan", label: "Site Binungan" },
  { value: "kintap", label: "Site Kintap" },
];

const UNIT_OPTIONS: FilterDropdownOption[] = Array.from({ length: 120 }, (_, i) => ({
  value: `unit-${i + 1}`,
  label: `HD785-${String(i + 1).padStart(3, "0")}`,
}));

const STATUS_OPTIONS: FilterDropdownOption[] = [
  { value: "semua", label: "Semua status" },
  { value: "selesai", label: "Selesai" },
  { value: "proses", label: "Proses" },
  { value: "ditolak", label: "Ditolak" },
];

/** Clicks the first trigger so the panel is open when the story loads. */
const openPanel: Story["play"] = async ({ canvasElement }) => {
  const [trigger] = within(canvasElement).getAllByRole("button");
  await userEvent.click(trigger);
};

const meta = {
  title: "Components/FilterDropdown",
  component: MultiSelectOptionDropdown,
  parameters: {
    docs: {
      importPath:
        'import { MultiSelectOptionDropdown, SingleSelectOptionDropdown, type FilterDropdownOption } from "@mono/ui";',
    },
  },
  args: { label: "Site", options: SITE_OPTIONS, value: [], onChange: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["dropdown", "inline"] },
    fullWidth: { control: "boolean" },
    showSelectAll: { control: "boolean" },
    disabled: { control: "boolean" },
    options: { control: false },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <MultiSelectOptionDropdown
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof MultiSelectOptionDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The trigger turns primary and shows a count badge once something is selected. */
export const WithSelection: Story = {
  args: { value: ["bengalon", "lati"] },
};

/** Long option lists get search and infinite scroll; `showSelectAll` adds "Pilih semua". */
export const ManyOptions: Story = {
  args: { label: "Unit", options: UNIT_OPTIONS, showSelectAll: true },
};

/** Rendered open (the panel is opened by clicking the trigger on load). */
export const Open: Story = {
  args: { value: ["sangatta"] },
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
  play: openPanel,
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** `variant="inline"` renders a collapsible section in place, for use inside a sheet. */
export const InlineVariant: Story = {
  args: { variant: "inline", value: ["kintap"] },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};

/**
 * `SingleSelectOptionDropdown` picks one value and closes. Selecting anything other
 * than `neutralValue` marks the trigger active.
 */
export const SingleSelect: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | null>("semua");
    return (
      <SingleSelectOptionDropdown
        label="Status"
        options={STATUS_OPTIONS}
        value={value}
        onChange={setValue}
        neutralValue="semua"
      />
    );
  },
};

/** Older `MultiSelectDropdown` with plain string options. Prefer `MultiSelectOptionDropdown`. */
export const LegacyStringOptions: Story = {
  render: function Render() {
    const [value, setValue] = useState<string[]>([]);
    return (
      <MultiSelectDropdown
        label="Kontraktor"
        options={["PT Pama Persada", "PT Buma", "PT Thiess", "PT SIS"]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** On mobile the panel opens as a bottom sheet instead of a popover. */
export const Mobile: Story = {
  ...mobileStory,
  args: { fullWidth: true, value: ["bengalon"] },
  play: openPanel,
};

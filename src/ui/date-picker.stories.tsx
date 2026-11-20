import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { fn } from "storybook/test";
import { z } from "zod";

import { mobileStory } from "../../.storybook/docs/mobile";
import { Button } from "./button.js";
import { DatePickerBase, FormDatePicker } from "./date-picker.js";

const meta = {
  title: "Components/DatePicker",
  component: DatePickerBase,
  parameters: {
    docs: { importPath: 'import { DatePickerBase, FormDatePicker } from "@mono/ui";' },
  },
  args: {
    label: "Tanggal laporan",
    placeholder: "Pilih tanggal",
    value: "",
    onChange: fn(),
    disabled: false,
    disablePast: false,
    invalid: false,
  },
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    disablePast: { control: "boolean" },
    invalid: { control: "boolean" },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? "");
    return (
      <div className="w-full max-w-xs">
        <DatePickerBase
          {...args}
          value={value}
          onChange={(next) => {
            setValue(next);
            args.onChange(next);
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof DatePickerBase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: "2026-11-18" },
};

/** `disablePast` blocks days before today (WITA), e.g. for planning a unit's service date. */
export const DisablePast: Story = {
  args: { label: "Jadwal servis unit", disablePast: true },
};

export const States: Story = {
  render: (args) => (
    <div className="grid w-full max-w-xs gap-4">
      <DatePickerBase {...args} label="Invalid" invalid />
      <DatePickerBase {...args} label="Disabled" value="2026-11-18" disabled />
    </div>
  ),
};

/** `FormDatePicker` binds to react-hook-form and shows the field's validation message. */
export const InForm: Story = {
  render: function Render() {
    const schema = z.object({
      tanggal: z.string().min(1, "Tanggal wajib diisi"),
    });
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: { tanggal: "" },
    });
    const [saved, setSaved] = useState<string | null>(null);
    return (
      <form
        className="grid w-full max-w-xs gap-4"
        onSubmit={form.handleSubmit((values) => setSaved(values.tanggal))}
      >
        <FormDatePicker control={form.control} name="tanggal" label="Tanggal pengisian fuel" />
        <Button type="submit" className="w-fit">
          Simpan
        </Button>
        {saved && <p className="text-sm text-muted-foreground">Tersimpan: {saved}</p>}
      </form>
    );
  },
};

/** Below `md`, tapping the trigger opens the calendar in a bottom sheet instead of a popover. */
export const Mobile: Story = {
  ...mobileStory,
  args: { value: "2026-11-18" },
};

import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import { userEvent, within } from "storybook/test";
import { z } from "zod";

import { mobileStory } from "../../.storybook/docs/mobile";
import { Form } from "../ui/form.js";
import { FloatingMultiSelect, type MultiSelectOption } from "./floating-multi-select.js";

const SITES: MultiSelectOption[] = [
  { value: "bontang", label: "Site Bontang" },
  { value: "sangatta", label: "Site Sangatta" },
  { value: "satui", label: "Site Satui" },
  { value: "melak", label: "Site Melak" },
  { value: "tanjung", label: "Site Tanjung" },
  { value: "kintap", label: "Site Kintap" },
];

const meta = {
  title: "Components/FloatingMultiSelect",
  component: FloatingMultiSelect,
  parameters: {
    docs: { importPath: 'import { FloatingMultiSelect, SELECT_ALL_VALUE } from "@mono/ui";' },
  },
  args: {
    name: "sites",
    label: "Site",
    noun: "Site",
    options: SITES,
    searchPlaceholder: "Cari site",
    // Supplied by the form wrapper in `render`.
    control: undefined as never,
  },
  argTypes: {
    control: { table: { disable: true } },
    allowSelectAll: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const form = useForm<FieldValues>({ defaultValues: { [args.name]: [] } });
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingMultiSelect {...args} control={form.control} />
        </form>
      </Form>
    );
  },
} satisfies Meta<typeof FloatingMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The trigger summarises the pick with `noun`: "2 Site Terpilih". */
export const WithValue: Story = {
  render: function Render(args) {
    const form = useForm<FieldValues>({
      defaultValues: { [args.name]: ["bontang", "satui"] },
    });
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingMultiSelect {...args} control={form.control} />
        </form>
      </Form>
    );
  },
};

/**
 * `allowSelectAll` adds a "Pilih Semua" row. Picking it stores `["all"]`
 * (`SELECT_ALL_VALUE`), which the API reads as every option, and locks the single rows.
 */
export const SelectAll: Story = {
  args: { allowSelectAll: true },
  render: function Render(args) {
    const form = useForm<FieldValues>({ defaultValues: { [args.name]: ["all"] } });
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingMultiSelect {...args} control={form.control} />
        </form>
      </Form>
    );
  },
};

/** While `loading`, the open list shows skeleton checkbox rows. */
export const Loading: Story = {
  args: { loading: true, options: [] },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** The outline and label turn red and the schema message shows below. */
export const WithError: Story = {
  render: function Render() {
    const schema = z.object({ sites: z.array(z.string()).min(1, "Pilih minimal satu site") });
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: { sites: [] },
    });
    const { trigger } = form;
    useEffect(() => {
      void trigger();
    }, [trigger]);
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingMultiSelect
            control={form.control}
            name="sites"
            label="Site"
            noun="Site"
            options={SITES}
          />
        </form>
      </Form>
    );
  },
};

/** On mobile the list opens in a bottom sheet (`DynamicModal`) instead of a popover. */
export const Mobile: Story = {
  ...mobileStory,
  args: { allowSelectAll: true },
  play: async ({ canvasElement }) => {
    const trigger = await within(canvasElement).findByRole("button");
    await userEvent.click(trigger);
  },
};

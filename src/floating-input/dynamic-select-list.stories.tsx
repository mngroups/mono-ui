import type { Meta, StoryObj } from "@storybook/react-vite";
import { type FieldValues, useForm } from "react-hook-form";

import { Button } from "../ui/button.js";
import { Form } from "../ui/form.js";
import { DynamicSelectList } from "./dynamic-select-list.js";
import type { SelectOption } from "./floating-select.js";

const UNITS: SelectOption[] = [
  { value: "dt-1024", label: "DT-1024 (Dump Truck)" },
  { value: "dt-1031", label: "DT-1031 (Dump Truck)" },
  { value: "ex-210", label: "EX-210 (Excavator)" },
  { value: "gd-07", label: "GD-07 (Grader)" },
  { value: "wt-03", label: "WT-03 (Water Truck)" },
];

const meta = {
  title: "Components/DynamicSelectList",
  component: DynamicSelectList,
  parameters: {
    docs: { importPath: 'import { DynamicSelectList } from "@mono/ui";' },
  },
  args: {
    name: "units",
    label: "Unit",
    addLabel: "Unit lain",
    options: UNITS,
    // Supplied by the form wrapper in `render`.
    control: undefined as never,
  },
  argTypes: {
    control: { table: { disable: true } },
    searchable: { control: "boolean" },
    loading: { control: "boolean" },
  },
  render: function Render(args) {
    const form = useForm<FieldValues>({ defaultValues: { [args.name]: [{ value: "" }] } });
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <DynamicSelectList {...args} control={form.control} />
        </form>
      </Form>
    );
  },
} satisfies Meta<typeof DynamicSelectList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * With several rows: an option picked in one row disappears from the others, and
 * each row gets a delete button once there is more than one.
 */
export const Prefilled: Story = {
  render: function Render(args) {
    const form = useForm<FieldValues>({
      defaultValues: { [args.name]: [{ value: "dt-1024" }, { value: "ex-210" }] },
    });
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <DynamicSelectList {...args} control={form.control} />
        </form>
      </Form>
    );
  },
};

/** Field values are `{ value: string }[]`; submit to see the shape. */
export const InAForm: Story = {
  render: function Render() {
    const form = useForm<{ units: { value: string }[] }>({
      defaultValues: { units: [{ value: "dt-1031" }] },
    });
    const submitted = form.formState.isSubmitSuccessful ? form.getValues() : null;
    return (
      <Form {...form}>
        <form className="grid max-w-sm gap-4" onSubmit={form.handleSubmit(() => {})}>
          <DynamicSelectList
            control={form.control}
            name="units"
            label="Unit"
            addLabel="Unit lain"
            options={UNITS}
            searchPlaceholder="Cari unit..."
          />
          <Button type="submit">Simpan penugasan</Button>
          {submitted && (
            <pre className="rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          )}
        </form>
      </Form>
    );
  },
};

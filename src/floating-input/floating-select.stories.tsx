import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import { userEvent, within } from "storybook/test";
import { z } from "zod";

import { mobileStory } from "../../.storybook/docs/mobile";
import { Form } from "../ui/form.js";
import { FloatingSelect, type SelectOption } from "./floating-select.js";

const SITES: SelectOption[] = [
  { value: "bontang", label: "Site Bontang" },
  { value: "sangatta", label: "Site Sangatta" },
  { value: "satui", label: "Site Satui" },
  { value: "melak", label: "Site Melak" },
  { value: "tanjung", label: "Site Tanjung" },
];

const KONTRAKTOR = Array.from({ length: 60 }, (_, i) => ({
  value: `k-${i + 1}`,
  label: `PT Kontraktor Tambang ${i + 1}`,
}));

const meta = {
  title: "Components/FloatingSelect",
  component: FloatingSelect,
  parameters: {
    docs: { importPath: 'import { FloatingSelect } from "@mono/ui";' },
  },
  args: {
    name: "site",
    label: "Site",
    options: SITES,
    // Supplied by the form wrapper in `render`.
    control: undefined as never,
  },
  argTypes: {
    control: { table: { disable: true } },
    searchable: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    disableFloating: { control: "boolean" },
  },
  render: function Render(args) {
    const form = useForm<FieldValues>({ defaultValues: { [args.name]: "" } });
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingSelect {...args} control={form.control} />
        </form>
      </Form>
    );
  },
} satisfies Meta<typeof FloatingSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `searchable` adds a search box; without `onSearchChange` the list is filtered locally. */
export const Searchable: Story = {
  args: { searchable: true, searchPlaceholder: "Cari site..." },
};

/** A prefilled value, with a `prefix` icon. */
export const WithValue: Story = {
  render: function Render(args) {
    const form = useForm<FieldValues>({ defaultValues: { [args.name]: "sangatta" } });
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingSelect {...args} control={form.control} prefix={<MapPin size={16} />} />
        </form>
      </Form>
    );
  },
};

/**
 * Server-side search and infinite scroll: `onSearchChange` receives the debounced
 * keyword, `hasMore` + `onLoadMore` fetch the next page, `loading` shows skeleton rows.
 */
export const ServerSearchAndPaging: Story = {
  render: function Render() {
    const form = useForm({ defaultValues: { kontraktor: "" } });
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const matches = KONTRAKTOR.filter((k) => k.label.toLowerCase().includes(keyword.toLowerCase()));
    const options = matches.slice(0, page * 15);

    const fakeFetch = (next: () => void) => {
      setLoading(true);
      setTimeout(() => {
        next();
        setLoading(false);
      }, 600);
    };

    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingSelect
            control={form.control}
            name="kontraktor"
            label="Kontraktor"
            options={options}
            searchable
            searchPlaceholder="Cari kontraktor..."
            loading={loading}
            hasMore={options.length < matches.length}
            onSearchChange={(value) => {
              if (value === keyword) return;
              fakeFetch(() => {
                setKeyword(value);
                setPage(1);
              });
            }}
            onLoadMore={() => fakeFetch(() => setPage((p) => p + 1))}
          />
        </form>
      </Form>
    );
  },
};

/** While `loading`, the open list shows skeleton rows instead of options. */
export const Loading: Story = {
  args: { loading: true, options: [] },
};

/** The outline and label turn red and the schema message shows below. */
export const WithError: Story = {
  render: function Render() {
    const schema = z.object({ site: z.string().min(1, "Site wajib dipilih") });
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: { site: "" },
    });
    const { trigger } = form;
    useEffect(() => {
      void trigger();
    }, [trigger]);
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingSelect control={form.control} name="site" label="Site" options={SITES} />
        </form>
      </Form>
    );
  },
};

/** On mobile the list opens in a bottom sheet (`DynamicModal`) instead of a dropdown. */
export const Mobile: Story = {
  ...mobileStory,
  args: { searchable: true, searchPlaceholder: "Cari site..." },
  play: async ({ canvasElement }) => {
    const trigger = await within(canvasElement).findByRole("button");
    await userEvent.click(trigger);
  },
};

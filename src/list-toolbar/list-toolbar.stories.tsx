import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { useState } from "react";
import { userEvent, within } from "storybook/test";

import { mobileStory } from "../../.storybook/docs/mobile";
import {
  type FilterDropdownOption,
  MultiSelectOptionDropdown,
  SingleSelectOptionDropdown,
} from "../filter-dropdown/filter-dropdown.js";
import { Button } from "../ui/button.js";
import { ListSearchInput, ListToolbar } from "./list-toolbar.js";

type Filters = { sites: string[]; status: string };

const EMPTY_FILTERS: Filters = { sites: [], status: "semua" };

const SITE_OPTIONS: FilterDropdownOption[] = [
  { value: "bengalon", label: "Site Bengalon" },
  { value: "sangatta", label: "Site Sangatta" },
  { value: "lati", label: "Site Lati" },
  { value: "kintap", label: "Site Kintap" },
];

const STATUS_OPTIONS: FilterDropdownOption[] = [
  { value: "semua", label: "Semua status" },
  { value: "selesai", label: "Selesai" },
  { value: "proses", label: "Proses" },
];

const countActive = (f: Filters) => (f.sites.length > 0 ? 1 : 0) + (f.status !== "semua" ? 1 : 0);

/** Search, two filters and an add button, wired to local state. */
function FilteredToolbar(props: {
  trigger?: "icon" | "block";
  initial?: Filters;
  noSearch?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(props.initial ?? EMPTY_FILTERS);
  return (
    <ListToolbar
      search={search}
      onSearchChange={props.noSearch ? undefined : setSearch}
      searchLabel="Cari unit atau kontraktor"
      trigger={props.trigger}
      activeFilterCount={countActive(filters)}
      onResetFilters={() => setFilters(EMPTY_FILTERS)}
      filters={(inSheet) => (
        <>
          <MultiSelectOptionDropdown
            label="Site"
            options={SITE_OPTIONS}
            value={filters.sites}
            onChange={(sites) => setFilters((f) => ({ ...f, sites }))}
            fullWidth={inSheet}
          />
          <SingleSelectOptionDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            neutralValue="semua"
            onChange={(status) => setFilters((f) => ({ ...f, status }))}
            fullWidth={inSheet}
          />
        </>
      )}
      action={
        <Button>
          <Plus /> Tambah transaksi
        </Button>
      }
    />
  );
}

const meta = {
  title: "Components/ListToolbar",
  component: ListToolbar<Filters>,
  parameters: {
    docs: { importPath: 'import { ListSearchInput, ListToolbar } from "@mono/ui";' },
  },
  args: { searchLabel: "Cari unit", activeFilterCount: 0 },
  argTypes: {
    trigger: { control: "inline-radio", options: ["icon", "block"] },
    activeFilterCount: { control: "number" },
  },
  render: function Render(args) {
    const [search, setSearch] = useState("");
    return <ListToolbar<Filters> {...args} search={search} onSearchChange={setSearch} />;
  },
} satisfies Meta<typeof ListToolbar<Filters>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * From `lg` up the filters sit inline next to the search box; below it they move
 * into one bottom sheet behind a filter button badged with `activeFilterCount`.
 */
export const WithFilters: Story = {
  render: () => <FilteredToolbar initial={{ sites: ["bengalon"], status: "semua" }} />,
};

/**
 * `draft` holds sheet picks until "Terapkan", so the list refetches once per apply
 * instead of once per tap. On desktop the inline `filters` still apply directly;
 * narrow the window below `lg` to use the sheet.
 */
export const DraftFilters: Story = {
  render: function Render() {
    const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
    return (
      <div className="space-y-3">
        <ListToolbar<Filters>
          activeFilterCount={countActive(applied)}
          onResetFilters={() => setApplied(EMPTY_FILTERS)}
          trigger="block"
          draft={{
            values: applied,
            emptyValues: EMPTY_FILTERS,
            onApply: setApplied,
            render: (draft, setDraft) => (
              <>
                <MultiSelectOptionDropdown
                  label="Site"
                  options={SITE_OPTIONS}
                  value={draft.sites}
                  onChange={(sites) => setDraft({ ...draft, sites })}
                  fullWidth
                />
                <SingleSelectOptionDropdown
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={draft.status}
                  neutralValue="semua"
                  onChange={(status) => setDraft({ ...draft, status })}
                  fullWidth
                />
              </>
            ),
          }}
          filters={() => (
            <>
              <MultiSelectOptionDropdown
                label="Site"
                options={SITE_OPTIONS}
                value={applied.sites}
                onChange={(sites) => setApplied((f) => ({ ...f, sites }))}
              />
              <SingleSelectOptionDropdown
                label="Status"
                options={STATUS_OPTIONS}
                value={applied.status}
                neutralValue="semua"
                onChange={(status) => setApplied((f) => ({ ...f, status }))}
              />
            </>
          )}
        />
        <p className="text-xs text-foreground/50">
          Filter aktif: {applied.sites.join(", ") || "semua site"} · {applied.status}
        </p>
      </div>
    );
  },
};

/** `ListSearchInput` on its own: clear button and Escape both empty it. */
export const SearchInputOnly: Story = {
  render: function Render() {
    const [value, setValue] = useState("HD785");
    return <ListSearchInput value={value} onChange={setValue} label="Cari unit" />;
  },
};

/** At 360px: search, filter button and action share one row; the sheet is opened on load. */
export const Mobile: Story = {
  ...mobileStory,
  render: () => <FilteredToolbar initial={{ sites: ["lati", "kintap"], status: "proses" }} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Buka filter" }));
  },
};

/** `trigger="block"` makes the filter button full width with a label, for lists without search. */
export const MobileBlockTrigger: Story = {
  ...mobileStory,
  render: () => <FilteredToolbar trigger="block" noSearch />,
};

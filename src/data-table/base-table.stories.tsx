import { cn, formatIndonesianNumber } from "@mono/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.js";
import { BaseTable } from "./base-table.js";
import type { SortDirection, TableColumn } from "./data-table-types.js";
import { STICKY_SHADOW } from "./sticky-column.js";

type UnitRow = { id: string; unit: string; site: string; jamOperasi: number; fuel: number };

const ROWS: UnitRow[] = [
  { id: "u1", unit: "HD785-12", site: "Site Bengalon", jamOperasi: 182, fuel: 14250 },
  { id: "u2", unit: "PC2000-04", site: "Site Sangatta", jamOperasi: 201, fuel: 18900 },
  { id: "u3", unit: "D375A-07", site: "Site Lati", jamOperasi: 164, fuel: 9870 },
  { id: "u4", unit: "HD785-21", site: "Site Binungan", jamOperasi: 175, fuel: 13420 },
  { id: "u5", unit: "GD825-02", site: "Site Kintap", jamOperasi: 98, fuel: 4310 },
  { id: "u6", unit: "PC1250-09", site: "Site Bengalon", jamOperasi: 156, fuel: 11780 },
];

const COLUMNS: TableColumn<UnitRow>[] = [
  { id: "unit", header: "Unit", accessorKey: "unit" },
  { id: "site", header: "Site", accessorKey: "site" },
  {
    id: "jamOperasi",
    header: "Jam operasi",
    horizontalAlign: "right",
    cell: (row) => `${row.jamOperasi} jam`,
  },
  {
    id: "fuel",
    header: "Fuel (L)",
    horizontalAlign: "right",
    cell: (row) => formatIndonesianNumber(row.fuel),
  },
];

const meta = {
  title: "Components/BaseTable",
  component: BaseTable<UnitRow>,
  parameters: {
    docs: {
      importPath: 'import { BaseTable, STICKY_SHADOW, type TableColumn } from "@mono/ui";',
    },
  },
  args: { columns: COLUMNS, data: ROWS },
  argTypes: {
    isStickyHeader: { control: "boolean" },
    freezeLeftColCount: { control: "number" },
    freezeRightColCount: { control: "number" },
    defaultHorizontalAlign: { control: "inline-radio", options: ["left", "center", "right"] },
    defaultRowVerticalAlign: { control: "inline-radio", options: ["top", "middle", "bottom"] },
    columns: { control: false },
    data: { control: false },
  },
} satisfies Meta<typeof BaseTable<UnitRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Header clicks cycle asc, desc, off; the caller sorts the rows. */
export const Sortable: Story = {
  render: function Render(args) {
    const [column, setColumn] = useState<string>();
    const [direction, setDirection] = useState<SortDirection>(false);
    const key = column as keyof UnitRow | undefined;
    const rows =
      key && direction
        ? [...args.data].sort((a, b) => (a[key] > b[key] ? 1 : -1) * (direction === "asc" ? 1 : -1))
        : args.data;
    return (
      <BaseTable<UnitRow>
        {...args}
        columns={args.columns.map((col) => ({ ...col, sortable: true }))}
        data={rows}
        sortColumn={column}
        sortDirection={direction}
        onSort={(id, next) => {
          setColumn(id);
          setDirection(next);
        }}
      />
    );
  },
};

/** The header stays visible while the body scrolls inside a height-limited container. */
export const StickyHeader: Story = {
  args: {
    isStickyHeader: true,
    className: "max-h-64",
    data: [...ROWS, ...ROWS.map((r) => ({ ...r, id: `${r.id}-b` }))],
  },
};

/** Click a row to toggle it; selected rows come from `selectedRowIds`. */
export const RowSelection: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState(new Set<string>(["u2"]));
    return (
      <BaseTable<UnitRow>
        {...args}
        selectedRowIds={selected}
        onBodyRowClick={(row) =>
          setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(row.id)) next.delete(row.id);
            else next.add(row.id);
            return next;
          })
        }
      />
    );
  },
};

/** `isInlineFooter` puts `children` in a `<tfoot>`, e.g. for a totals row. */
export const TotalsFooter: Story = {
  args: {
    isInlineFooter: true,
    children: (
      <TableRow>
        <TableCell colSpan={2} className="px-4 py-3 font-semibold">
          Total
        </TableCell>
        <TableCell className="px-4 py-3 text-right font-semibold">976 jam</TableCell>
        <TableCell className="px-4 py-3 text-right font-semibold">
          {formatIndonesianNumber(ROWS.reduce((sum, r) => sum + r.fuel, 0))}
        </TableCell>
      </TableRow>
    ),
  },
};

/** Highlight cells with `cellClassName`, e.g. fuel above a threshold. */
export const ConditionalStyling: Story = {
  args: {
    cellClassName: (row, columnId) =>
      columnId === "fuel" && row.fuel > 15000 ? "font-semibold text-destructive" : undefined,
  },
};

/**
 * `STICKY_SHADOW` is the class string `BaseTable` uses for the edge of a column
 * frozen on the right. Add it to your own sticky cell (with `position: sticky`)
 * when you build a table from the `Table*` primitives.
 */
export const StickyShadowHelper: Story = {
  render: () => (
    <div className="max-w-md rounded-xl border border-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            {["Unit", "Site", "Jam operasi", "Fuel (L)"].map((h) => (
              <TableHead key={h} className="min-w-36 px-4">
                {h}
              </TableHead>
            ))}
            <TableHead className={cn("sticky right-0 bg-background px-4", STICKY_SHADOW)}>
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.slice(0, 3).map((row) => (
            <TableRow key={row.id}>
              <TableCell className="px-4">{row.unit}</TableCell>
              <TableCell className="px-4">{row.site}</TableCell>
              <TableCell className="px-4">{row.jamOperasi} jam</TableCell>
              <TableCell className="px-4">{formatIndonesianNumber(row.fuel)}</TableCell>
              <TableCell className={cn("sticky right-0 bg-background px-4", STICKY_SHADOW)}>
                Detail
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

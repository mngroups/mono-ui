import { formatIndonesianNumber } from "@mono/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";

import { StatusLabel } from "../status-label/status-label.js";
import DataTable from "./data-table.js";
import type { SortDirection, TableColumn } from "./data-table-types.js";

type FuelRow = {
  id: string;
  site: string;
  kontraktor: string;
  unit: string;
  fuel: number;
  tonase: number;
  status: "Selesai" | "Proses" | "Ditolak";
};

const SITES = ["Site Bengalon", "Site Sangatta", "Site Lati", "Site Binungan", "Site Kintap"];
const KONTRAKTOR = ["PT Pama Persada", "PT Buma", "PT Thiess", "PT SIS", "PT HRS"];
const STATUSES: FuelRow["status"][] = ["Selesai", "Proses", "Ditolak"];

const ROWS: FuelRow[] = Array.from({ length: 23 }, (_, i) => ({
  id: `TRX-${String(1001 + i)}`,
  site: SITES[i % SITES.length],
  kontraktor: KONTRAKTOR[(i * 2) % KONTRAKTOR.length],
  unit: `HD785-${String(10 + i)}`,
  fuel: 1200 + ((i * 137) % 900),
  tonase: 85 + ((i * 13) % 40),
  status: STATUSES[i % 3],
}));

const STATUS_TONE = { Selesai: "success", Proses: "info", Ditolak: "danger" } as const;

const COLUMNS: TableColumn<FuelRow>[] = [
  { id: "no", header: "No", width: 56, cell: (_row, index) => index + 1 },
  { id: "id", header: "No. Transaksi", accessorKey: "id" },
  { id: "site", header: "Site", accessorKey: "site" },
  { id: "kontraktor", header: "Kontraktor", accessorKey: "kontraktor" },
  { id: "unit", header: "Unit", accessorKey: "unit" },
  {
    id: "fuel",
    header: "Fuel (L)",
    horizontalAlign: "right",
    cell: (row) => formatIndonesianNumber(row.fuel),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusLabel tone={STATUS_TONE[row.status]}>{row.status}</StatusLabel>,
  },
];

const meta = {
  title: "Components/DataTable",
  component: DataTable<FuelRow>,
  parameters: {
    docs: { importPath: 'import { DataTable, type TableColumn } from "@mono/ui";' },
  },
  args: { columns: COLUMNS, data: ROWS.slice(0, 5) },
  argTypes: {
    isLoading: { control: "boolean" },
    isStickyHeader: { control: "boolean" },
    clientPageSize: { control: "number" },
    freezeLeftColCount: { control: "number" },
    freezeRightColCount: { control: "number" },
    columns: { control: false },
    data: { control: false },
  },
} satisfies Meta<typeof DataTable<FuelRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Pass the full list and `clientPageSize`; row numbers continue across pages. */
export const ClientPagination: Story = {
  args: { data: ROWS, clientPageSize: 10 },
};

/** With `pagination`, `data` is already the current page fetched from the server. */
export const ServerPagination: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const pageRows = ROWS.slice((page - 1) * pageSize, page * pageSize);
    return (
      <DataTable<FuelRow>
        {...args}
        data={pageRows}
        pagination={{ total: ROWS.length, current: page, pageSize, onChange: setPage }}
      />
    );
  },
};

/** Sorting is controlled: the table reports header clicks, you sort the data. */
export const Sortable: Story = {
  render: function Render(args) {
    const [sort, setSort] = useState<{ column?: string; direction: SortDirection }>({
      direction: false,
    });
    const sortable = useMemo(
      () =>
        args.columns.map((col) =>
          col.id === "site" || col.id === "fuel" ? { ...col, sortable: true } : col
        ),
      [args.columns]
    );
    const sorted = useMemo(() => {
      if (!sort.column || !sort.direction) return args.data;
      const key = sort.column as keyof FuelRow;
      const factor = sort.direction === "asc" ? 1 : -1;
      return [...args.data].sort((a, b) => (a[key] > b[key] ? factor : -factor));
    }, [args.data, sort]);
    return (
      <DataTable<FuelRow>
        {...args}
        columns={sortable}
        data={sorted}
        sortColumn={sort.column}
        sortDirection={sort.direction}
        onSort={(column, direction) => setSort({ column, direction })}
      />
    );
  },
  args: { data: ROWS.slice(0, 8) },
};

/** Freeze the first and last columns so they stay put while the middle scrolls sideways. */
export const FrozenColumns: Story = {
  args: {
    data: ROWS.slice(0, 6),
    freezeLeftColCount: 2,
    freezeRightColCount: 1,
    columns: [
      ...COLUMNS.slice(0, 5).map((col) => ({ ...col, minWidth: 160 })),
      {
        id: "tonase",
        header: "Tonase (ton)",
        minWidth: 160,
        horizontalAlign: "right" as const,
        cell: (row: FuelRow) => formatIndonesianNumber(row.tonase),
      },
      ...COLUMNS.slice(5).map((col) => ({ ...col, minWidth: 140 })),
    ],
  },
};

export const Loading: Story = {
  args: { isLoading: true },
};

/** An empty `data` array renders the shared `EmptyData` state. */
export const Empty: Story = {
  args: { data: [] },
};

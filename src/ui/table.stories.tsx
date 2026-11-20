import { formatIndonesianNumber } from "@mono/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table.js";

const ROWS = [
  { kontraktor: "PT Pama Persada", site: "Site Bengalon", ritase: 412, tonase: 38420 },
  { kontraktor: "PT Buma", site: "Site Lati", ritase: 365, tonase: 33105 },
  { kontraktor: "PT Thiess", site: "Site Sangatta", ritase: 298, tonase: 27860 },
  { kontraktor: "PT SIS", site: "Site Binungan", ritase: 251, tonase: 22940 },
];

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: {
    docs: {
      importPath:
        'import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@mono/ui";',
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Kontraktor</TableHead>
          <TableHead>Site</TableHead>
          <TableHead className="text-right">Ritase</TableHead>
          <TableHead className="text-right">Tonase (ton)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.kontraktor}>
            <TableCell className="font-medium">{row.kontraktor}</TableCell>
            <TableCell>{row.site}</TableCell>
            <TableCell className="text-right">{row.ritase}</TableCell>
            <TableCell className="text-right">{formatIndonesianNumber(row.tonase)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** `TableFooter` for totals and `TableCaption` for a note under the table. */
export const FooterAndCaption: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>Produksi batubara per kontraktor, November 2026.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Kontraktor</TableHead>
          <TableHead className="text-right">Tonase (ton)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.kontraktor}>
            <TableCell>{row.kontraktor}</TableCell>
            <TableCell className="text-right">{formatIndonesianNumber(row.tonase)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right">
            {formatIndonesianNumber(ROWS.reduce((sum, r) => sum + r.tonase, 0))}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

/** `data-state="selected"` on a `TableRow` gives it the selected background. */
export const SelectedRow: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Kontraktor</TableHead>
          <TableHead>Site</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row, i) => (
          <TableRow key={row.kontraktor} data-state={i === 1 ? "selected" : undefined}>
            <TableCell>{row.kontraktor}</TableCell>
            <TableCell>{row.site}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Wide tables scroll sideways inside the container; style it with `containerClassName`. */
export const HorizontalScroll: Story = {
  args: { containerClassName: "max-w-md rounded-xl border border-foreground/10" },
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          {["Kontraktor", "Site", "Ritase", "Tonase (ton)", "Fuel (L)", "Jam operasi"].map((h) => (
            <TableHead key={h} className="min-w-32 px-4">
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.kontraktor}>
            <TableCell className="px-4">{row.kontraktor}</TableCell>
            <TableCell className="px-4">{row.site}</TableCell>
            <TableCell className="px-4">{row.ritase}</TableCell>
            <TableCell className="px-4">{formatIndonesianNumber(row.tonase)}</TableCell>
            <TableCell className="px-4">{formatIndonesianNumber(row.ritase * 31)}</TableCell>
            <TableCell className="px-4">{Math.round(row.ritase / 2)} jam</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

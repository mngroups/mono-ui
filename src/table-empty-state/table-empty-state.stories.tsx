import type { Meta, StoryObj } from "@storybook/react-vite";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.js";
import { TableEmptyState } from "./table-empty-state.js";

const meta = {
  title: "Components/TableEmptyState",
  component: TableEmptyState,
  parameters: {
    docs: { importPath: 'import { TableEmptyState } from "@mono/ui";' },
  },
  args: { message: "Tidak ada data" },
} satisfies Meta<typeof TableEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Say why it is empty when you know, e.g. a search or filter with no match. */
export const FilteredNoMatch: Story = {
  args: { message: "Tidak ada unit yang cocok dengan filter" },
};

/** Inside a table body: one cell spanning every column. */
export const InsideTable: Story = {
  render: (args) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Unit</TableHead>
          <TableHead>Kontraktor</TableHead>
          <TableHead className="text-right">Fuel (L)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3}>
            <TableEmptyState {...args} />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

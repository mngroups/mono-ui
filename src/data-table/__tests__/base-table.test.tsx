import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BaseTable } from "../base-table.js";
import type { TableColumn } from "../data-table-types.js";

type Row = { id?: string; name: string; qty: number };

const rows: Row[] = [
  { id: "a", name: "Alpha", qty: 1 },
  { id: "b", name: "Beta", qty: 2 },
];

const columns: TableColumn<Row>[] = [
  { id: "name", header: "Nama", accessorKey: "name", width: 120, minWidth: 80 },
  { id: "qty", header: () => "Jumlah", accessorKey: "qty", horizontalAlign: "right" },
  { id: "empty", header: "Kosong" },
  { id: "action", header: "Aksi", cell: (row) => `aksi-${row.name}`, horizontalAlign: "center" },
];

function bodyRows() {
  const [, body] = screen.getAllByRole("rowgroup");
  return within(body).getAllByRole("row");
}

describe("BaseTable", () => {
  it("renders headers (node or function), accessor and cell values", () => {
    render(<BaseTable<Row> columns={columns} data={rows} dataTestId="tbl" />);
    expect(screen.getByTestId("tbl")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Jumlah" })).toHaveClass("text-right");
    const cells = within(bodyRows()[0]).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Alpha");
    expect(cells[0].style.width).toBe("120px");
    expect(cells[1]).toHaveTextContent("1");
    expect(cells[2]).toBeEmptyDOMElement();
    expect(cells[3]).toHaveTextContent("aksi-Alpha");
  });

  it("freezes left and right columns with sticky offsets", () => {
    render(
      <BaseTable<Row>
        columns={columns}
        data={rows}
        freezeLeftColCount={2}
        freezeRightColCount={1}
        isStickyHeader
      />
    );
    const cells = within(bodyRows()[0]).getAllByRole("cell");
    expect(cells[0].style.position).toBe("sticky");
    expect(cells[0].style.left).toBe("0px");
    expect(cells[1].style.left).toBe("0px"); // jsdom measures every column as 0px wide
    expect(cells[2].style.position).toBe("");
    expect(cells[3].style.right).toBe("0px");
    expect(cells[1].className).toContain("after:absolute");
    expect(cells[3].className).toContain("before:absolute");
    expect(screen.getAllByRole("rowgroup")[0]).toHaveClass("sticky");
  });

  it("offsets frozen columns by the measured widths of the columns before them", () => {
    const spy = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(100);
    render(
      <BaseTable<Row>
        columns={columns}
        data={rows}
        freezeLeftColCount={2}
        freezeRightColCount={2}
      />
    );
    const cells = within(bodyRows()[0]).getAllByRole("cell");
    expect(cells[1].style.left).toBe("100px");
    expect(cells[2].style.right).toBe("100px");
    expect(cells[3].style.right).toBe("0px");
    spy.mockRestore();
  });

  it("re-measures frozen columns when they resize", () => {
    let width = 50;
    const spy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(() => width);
    let notify = () => {};
    const original = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      constructor(cb: () => void) {
        notify = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;

    render(<BaseTable<Row> columns={columns} data={rows} freezeLeftColCount={2} />);
    const cell = () => within(bodyRows()[0]).getAllByRole("cell")[1];
    expect(cell().style.left).toBe("50px");

    act(() => notify()); // same widths: no update
    expect(cell().style.left).toBe("50px");

    width = 80;
    act(() => notify());
    expect(cell().style.left).toBe("80px");

    globalThis.ResizeObserver = original;
    spy.mockRestore();
  });

  it("cycles sorting asc → desc → off and marks the sorted header", () => {
    const onSort = vi.fn();
    const sortable: TableColumn<Row>[] = [
      { id: "name", header: "Nama", accessorKey: "name", sortable: true },
      {
        id: "qty",
        header: "Jumlah",
        accessorKey: "qty",
        sortable: true,
        disableSortingTrigger: true,
      },
    ];
    const { rerender } = render(<BaseTable<Row> columns={sortable} data={rows} onSort={onSort} />);
    fireEvent.click(screen.getByRole("button", { name: "Nama" }));
    expect(onSort).toHaveBeenLastCalledWith("name", "asc");
    expect(screen.getByRole("button", { name: "Jumlah" })).toBeDisabled();

    rerender(
      <BaseTable<Row>
        columns={sortable}
        data={rows}
        onSort={onSort}
        sortColumn="name"
        sortDirection="asc"
      />
    );
    expect(screen.getByRole("columnheader", { name: "Nama" })).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
    fireEvent.click(screen.getByRole("button", { name: "Nama" }));
    expect(onSort).toHaveBeenLastCalledWith("name", "desc");

    rerender(
      <BaseTable<Row>
        columns={sortable}
        data={rows}
        onSort={onSort}
        sortColumn="name"
        sortDirection="desc"
      />
    );
    expect(screen.getByRole("columnheader", { name: "Nama" })).toHaveAttribute(
      "aria-sort",
      "descending"
    );
    fireEvent.click(screen.getByRole("button", { name: "Nama" }));
    expect(onSort).toHaveBeenLastCalledWith("name", false);
  });

  it("handles row clicks, selection and per-row/cell classes", () => {
    const onBodyRowClick = vi.fn();
    render(
      <BaseTable<Row>
        columns={columns}
        data={[...rows, { name: "Tanpa id", qty: 3 }]}
        selectedRowIds={new Set(["b"])}
        onBodyRowClick={onBodyRowClick}
        rowClassName={(_row, i) => `row-${i}`}
        customStylingFn={{ customBodyColumnStylesFn: (_r, col) => `fn-${col}` }}
        customStyling={{
          customBodyRowSelectedStyles: "row-selected",
          customBodyColumnSelectedStyles: "cell-selected",
          customBodyContentContainerStyles: "content-wrap",
        }}
      />
    );
    const [first, second, third] = bodyRows();
    expect(first).toHaveClass("row-0", "cursor-pointer");
    expect(second).toHaveAttribute("data-state", "selected");
    expect(second).toHaveClass("row-selected");
    expect(within(second).getAllByRole("cell")[0]).toHaveClass("cell-selected", "fn-name");
    expect(third.querySelector(".content-wrap")).toHaveTextContent("Tanpa id");
    fireEvent.click(second);
    expect(onBodyRowClick).toHaveBeenCalledWith(rows[1], 1);
  });

  it("renders children inline as a tfoot or below the table", () => {
    const footerRow = (
      <tr>
        <td>Total</td>
      </tr>
    );
    const { rerender, container } = render(
      <BaseTable<Row> columns={columns} data={rows} isInlineFooter>
        {footerRow}
      </BaseTable>
    );
    expect(container.querySelector("tfoot")).toHaveTextContent("Total");

    rerender(
      <BaseTable<Row> columns={columns} data={rows}>
        <p>Catatan</p>
      </BaseTable>
    );
    expect(container.querySelector("tfoot")).toBeNull();
    expect(screen.getByText("Catatan")).toBeInTheDocument();
  });
});

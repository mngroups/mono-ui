import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DataTable from "../data-table.js";
import type { TableColumn } from "../data-table-types.js";
import EmptyDataComponent from "../empty-data.js";
import { STICKY_SHADOW } from "../sticky-column.js";

type Row = { id: string; name: string };

const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({ id: `r${i}`, name: `Item ${i + 1}` }));

const columns: TableColumn<Row>[] = [
  { id: "rowNumber", header: "No", cell: (_row, rowIndex) => `#${rowIndex + 1}` },
  { id: "name", header: "Nama", accessorKey: "name" },
];

function bodyRows() {
  const [, body] = screen.getAllByRole("rowgroup");
  return within(body).getAllByRole("row");
}

function goToNextPage() {
  // ListPagination renders desktop and mobile controls; jsdom keeps both in the DOM.
  const [nextButton] = screen.getAllByRole("button", { name: "Halaman berikutnya" }).slice(-1);
  fireEvent.click(nextButton);
}

describe("DataTable", () => {
  it("renders every row when no pagination is configured", () => {
    render(<DataTable<Row> columns={columns} data={rows} />);

    expect(bodyRows()).toHaveLength(25);
  });

  it("pages the data client-side and keeps absolute row numbers", () => {
    render(<DataTable<Row> columns={columns} data={rows} clientPageSize={10} />);

    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText("#1")).toBeInTheDocument();

    goToNextPage();

    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText("#11")).toBeInTheDocument();
    expect(screen.getByText("Item 11")).toBeInTheDocument();
    expect(screen.queryByText("#1")).not.toBeInTheDocument();
  });

  it("clamps to the last page when the data shrinks", () => {
    const { rerender } = render(
      <DataTable<Row> columns={columns} data={rows} clientPageSize={10} />
    );
    goToNextPage();
    goToNextPage();
    expect(screen.getByText("#21")).toBeInTheDocument();

    rerender(<DataTable<Row> columns={columns} data={rows.slice(0, 12)} clientPageSize={10} />);

    expect(bodyRows()).toHaveLength(2);
    expect(screen.getByText("#11")).toBeInTheDocument();
  });

  it("shows the skeleton instead of the table while loading", () => {
    render(<DataTable<Row> columns={columns} data={rows} isLoading />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("reports server-side page changes with the current page size", () => {
    const onChange = vi.fn();
    render(
      <DataTable<Row>
        columns={columns}
        data={rows.slice(0, 10)}
        pagination={{ total: 25, current: 1, pageSize: 10, onChange }}
      />
    );

    goToNextPage();
    expect(onChange).toHaveBeenCalledWith(2, 10);
  });
});

describe("DataTable styling", () => {
  it("makes frozen cells opaque and merges the caller's cell classes", () => {
    const threeCols: TableColumn<Row>[] = [
      ...columns,
      { id: "id", header: "ID", accessorKey: "id" },
    ];
    render(
      <DataTable<Row>
        columns={threeCols}
        data={rows.slice(0, 1)}
        freezeLeftColCount={1}
        freezeRightColCount={1}
        defaultRowVerticalAlign="top"
        cellClassName={() => "caller-cell"}
        customStyling={{ customBodyColumnStyles: "body-col" }}
      />
    );

    const cells = within(bodyRows()[0]).getAllByRole("cell");
    expect(cells[0].className).toContain("group-hover:bg-card");
    expect(cells[1].className).toContain("group-hover:bg-foreground/[0.05]");
    expect(cells[2].className).toContain("group-hover:bg-card");
    expect(cells[1]).toHaveClass("caller-cell");
  });

  it("shows the empty state when there is no data", () => {
    render(<DataTable<Row> columns={columns} data={[]} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Data belum tersedia")).toBeInTheDocument();
  });

  it("keeps cells without a renderer when paging past the first page", () => {
    const plainCols: TableColumn<Row>[] = [{ id: "name", header: "Nama", accessorKey: "name" }];
    render(<DataTable<Row> columns={plainCols} data={rows} clientPageSize={10} />);
    goToNextPage();
    expect(screen.getByText("Item 11")).toBeInTheDocument();
  });
});

describe("EmptyDataComponent", () => {
  it("navigates to backUrl when the illustration is clicked", () => {
    const { container } = render(<EmptyDataComponent backUrl="#kembali" />);
    fireEvent.click(container.querySelector("img") as HTMLImageElement);
    expect(window.location.hash).toBe("#kembali");
  });

  it("leaves the illustration inert without a backUrl", () => {
    const { container } = render(<EmptyDataComponent backUrl="" />);
    expect(container.querySelector("img")).not.toHaveClass("cursor-pointer");
  });
});

describe("STICKY_SHADOW", () => {
  it("draws the shadow with a pseudo-element", () => {
    expect(STICKY_SHADOW).toContain("before:absolute");
  });
});

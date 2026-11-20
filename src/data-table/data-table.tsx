"use client";

import { cn } from "@mono/utils";
import { type ReactNode, useMemo, useState } from "react";
import { ListPagination } from "../list-toolbar/list-toolbar.js";
import { Skeleton } from "../ui/skeleton.js";
import { BaseTable } from "./base-table.js";
import type { TableColumn, TableProps } from "./data-table-types.js";
import EmptyDataComponent from "./empty-data.js";

type TPagination = {
  total: number;
  current: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onChange: (page: number, pageSize: number) => void;
  onPageSizeChange?: (size: number) => void;
};

export type DataTableProps<T> = {
  /** Server-side pagination: `data` is already the current page. */
  pagination?: TPagination;
  /**
   * Client-side pagination: `data` is the full list and the wrapper pages it.
   * Cells receive the absolute row index, so row numbering continues across pages.
   */
  clientPageSize?: number;
  /** Kept for backward compatibility; currently ignored. */
  emptyDataShowRetry?: boolean;
  /** Footer / extra content rendered below the table (or inside it with `isInlineFooter`). */
  children?: ReactNode;
  /** Shows a five-row skeleton instead of the table. */
  isLoading?: boolean;
} & TableProps<T>;

/**
 * Data table with loading skeleton, empty state and client- or server-side
 * pagination, on top of {@link BaseTable} (shadcn `Table` primitives).
 *
 * Exported as `DataTable`; `HorizonTable` is a deprecated alias of the same component.
 */
function DataTable<T extends object>({
  isLoading,
  pagination,
  clientPageSize,
  emptyDataShowRetry: _emptyDataShowRetry,
  ...props
}: DataTableProps<T>) {
  const [clientPage, setClientPage] = useState(1);

  const { columns, data, freezeLeftColCount = 0, freezeRightColCount = 0 } = props;
  const clientTotalPages = clientPageSize
    ? Math.max(1, Math.ceil(data.length / clientPageSize))
    : 1;
  // Clamp when the list shrinks (e.g. a filter) so we never land on an empty page.
  const page = Math.min(clientPage, clientTotalPages);
  const offset = clientPageSize ? (page - 1) * clientPageSize : 0;

  const pageData = useMemo(
    () => (clientPageSize ? data.slice(offset, offset + clientPageSize) : data),
    [data, offset, clientPageSize]
  );

  const pageColumns = useMemo<TableColumn<T>[]>(
    () =>
      offset === 0
        ? columns
        : columns.map((col) => {
            const { cell } = col;
            return cell
              ? { ...col, cell: (row: T, rowIndex: number) => cell(row, offset + rowIndex) }
              : col;
          }),
    [columns, offset]
  );

  // Frozen cells are opaque so scrolled columns don't bleed through, and need an
  // opaque hover colour too; the rest take the translucent hover tint.
  const frozenColumnIds = useMemo(() => {
    const ids = new Set<string>();
    columns.forEach((col, i) => {
      if (i < freezeLeftColCount || i >= columns.length - freezeRightColCount) ids.add(col.id);
    });
    return ids;
  }, [columns, freezeLeftColCount, freezeRightColCount]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      {data.length > 0 ? (
        <>
          <BaseTable<T>
            {...props}
            columns={pageColumns}
            data={pageData}
            defaultRowVerticalAlign={props.defaultRowVerticalAlign ?? "middle"}
            cellClassName={(row, columnId, rowIndex) =>
              cn(
                frozenColumnIds.has(columnId)
                  ? "group-hover:bg-card"
                  : "group-hover:bg-foreground/[0.05]",
                props.cellClassName?.(row, columnId, rowIndex)
              )
            }
            customStyling={{
              ...props.customStyling,
              customTableContainerStyles: cn(
                "scrollbar-modern overflow-x-auto",
                props.customStyling?.customTableContainerStyles
              ),
              customHeaderColumnStyles: cn(
                "border-r border-b border-foreground/10 bg-background text-foreground last:border-r-0",
                props.customStyling?.customHeaderColumnStyles
              ),
            }}
          >
            {props.children}
          </BaseTable>

          {pagination && (
            <ListPagination
              total={pagination.total}
              page={pagination.current}
              pageSize={pagination.pageSize}
              onChange={(p) => pagination.onChange?.(p, pagination.pageSize)}
            />
          )}
          {!pagination && clientPageSize && (
            <ListPagination
              total={data.length}
              page={page}
              pageSize={clientPageSize}
              onChange={setClientPage}
            />
          )}
        </>
      ) : (
        <EmptyDataComponent />
      )}
    </div>
  );
}

export default DataTable;

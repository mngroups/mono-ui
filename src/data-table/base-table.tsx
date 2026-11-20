"use client";

import { cn } from "@mono/utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { PlainButton } from "../ui/plain-button.js";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table.js";
import type {
  SortDirection,
  TableColumn,
  TableHorizontalAlign,
  TableProps,
  TableVerticalAlign,
} from "./data-table-types.js";
import { STICKY_SHADOW } from "./sticky-column.js";

const H_ALIGN: Record<TableHorizontalAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};
const V_ALIGN: Record<TableVerticalAlign, string> = {
  top: "align-top",
  middle: "align-middle",
  bottom: "align-bottom",
};
const JUSTIFY: Record<TableHorizontalAlign, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

/** Mirror of STICKY_SHADOW for the last left-frozen column (casts rightwards). */
const STICKY_SHADOW_RIGHT = cn(
  "after:pointer-events-none after:absolute after:inset-y-0 after:-right-1.5 after:w-1.5 after:content-['']",
  "after:bg-[linear-gradient(to_right,rgba(0,0,0,0.06),transparent)]",
  "dark:after:bg-[linear-gradient(to_right,rgba(0,0,0,0.28),transparent)]"
);

function nextSort(direction: SortDirection): SortDirection {
  return direction === "asc" ? "desc" : direction === "desc" ? false : "asc";
}

function renderHeader<T>(column: TableColumn<T>): ReactNode {
  return typeof column.header === "function" ? column.header() : column.header;
}

function renderCell<T>(column: TableColumn<T>, row: T, rowIndex: number): ReactNode {
  if (column.cell) return column.cell(row, rowIndex);
  if (column.accessorKey) return row[column.accessorKey] as ReactNode;
  return null;
}

function defaultRowId<T>(row: T, index: number): string {
  const id = (row as { id?: unknown }).id;
  return id === undefined || id === null ? String(index) : String(id);
}

/**
 * Column-driven table built on the shadcn `Table` primitives: frozen
 * left/right columns, sticky header, sortable headers, row selection and
 * per-element class overrides via `customStyling`.
 */
export function BaseTable<T>({
  columns,
  data,
  isStickyHeader = false,
  freezeLeftColCount = 0,
  freezeRightColCount = 0,
  defaultHeaderVerticalAlign = "middle",
  defaultRowVerticalAlign = "top",
  defaultHorizontalAlign = "left",
  isInlineFooter = false,
  customStyling = {},
  customStylingFn,
  onBodyRowClick,
  children,
  selectedRowIds,
  onSort,
  sortColumn,
  sortDirection = false,
  getRowId = defaultRowId,
  dataTestId,
  rowClassName,
  cellClassName,
  className,
  ...rest
}: TableProps<T>) {
  const headRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const [widths, setWidths] = useState<number[]>([]);
  const hasFrozen = freezeLeftColCount > 0 || freezeRightColCount > 0;

  // Sticky offsets need the rendered width of every frozen column before it.
  useLayoutEffect(() => {
    if (!hasFrozen) return;
    const cells = headRefs.current
      .slice(0, columns.length)
      .filter((el): el is HTMLTableCellElement => el !== null);
    const measure = () => {
      const next = cells.map((el) => el.offsetWidth);
      setWidths((prev) =>
        prev.length === next.length && prev.every((w, i) => w === next[i]) ? prev : next
      );
    };
    measure();
    /* v8 ignore if -- @preserve every supported browser has ResizeObserver */
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    for (const el of cells) observer.observe(el);
    return () => observer.disconnect();
  }, [hasFrozen, columns]);

  const frozenStyle = (index: number): CSSProperties | undefined => {
    if (index < freezeLeftColCount) {
      let left = 0;
      for (let i = 0; i < index; i++) left += widths[i] ?? 0;
      return { position: "sticky", left };
    }
    if (index >= columns.length - freezeRightColCount) {
      let right = 0;
      for (let i = columns.length - 1; i > index; i--) right += widths[i] ?? 0;
      return { position: "sticky", right };
    }
    return undefined;
  };
  const frozenShadow = (index: number) =>
    index === freezeLeftColCount - 1
      ? STICKY_SHADOW_RIGHT
      : freezeRightColCount > 0 && index === columns.length - freezeRightColCount
        ? STICKY_SHADOW
        : undefined;

  const sizeStyle = (column: TableColumn<T>): CSSProperties => ({
    width: column.width,
    minWidth: column.minWidth,
  });

  return (
    <div
      data-slot="data-table"
      data-testid={dataTestId}
      className={cn(
        "w-full overflow-hidden rounded-xl border border-foreground/10",
        customStyling.customContainerStyles,
        className
      )}
      {...rest}
    >
      <Table
        containerClassName={cn(
          isStickyHeader && "max-h-[inherit] overflow-y-auto",
          customStyling.customTableContainerStyles
        )}
        className={cn("border-separate border-spacing-0", customStyling.customTableStyles)}
      >
        <TableHeader
          className={cn(
            isStickyHeader && "sticky top-0 z-20",
            "[&_tr]:border-b-0",
            customStyling.customHeaderStyles
          )}
        >
          <TableRow className={cn("hover:bg-transparent", customStyling.customHeaderRowStyles)}>
            {columns.map((column, index) => {
              const align = column.horizontalAlign ?? defaultHorizontalAlign;
              const frozen = frozenStyle(index);
              const active = sortColumn === column.id ? sortDirection : false;
              const SortIcon =
                active === "asc" ? ArrowUp : active === "desc" ? ArrowDown : ArrowUpDown;
              return (
                <TableHead
                  key={column.id}
                  ref={(el) => {
                    headRefs.current[index] = el;
                  }}
                  aria-sort={
                    active === "asc" ? "ascending" : active === "desc" ? "descending" : undefined
                  }
                  style={{ ...sizeStyle(column), ...frozen }}
                  className={cn(
                    "h-auto bg-muted px-4 py-3 font-semibold",
                    H_ALIGN[align],
                    V_ALIGN[column.headerVerticalAlign ?? defaultHeaderVerticalAlign],
                    frozen && cn("z-10", frozenShadow(index)),
                    customStyling.customHeaderColumnStyles
                  )}
                >
                  {column.sortable && onSort ? (
                    <PlainButton
                      type="button"
                      disabled={column.disableSortingTrigger}
                      onClick={() => onSort(column.id, nextSort(active))}
                      className={cn(
                        "inline-flex w-full cursor-pointer items-center gap-1.5 disabled:cursor-default",
                        JUSTIFY[align],
                        customStyling.customHeaderContentContainerStyles
                      )}
                    >
                      {renderHeader(column)}
                      <SortIcon
                        aria-hidden
                        size={14}
                        className={cn("shrink-0", !active && "opacity-40")}
                      />
                    </PlainButton>
                  ) : (
                    <div
                      className={cn(
                        "flex items-center",
                        JUSTIFY[align],
                        customStyling.customHeaderContentContainerStyles
                      )}
                    >
                      {renderHeader(column)}
                    </div>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody className={customStyling.customBodyStyles}>
          {data.map((row, rowIndex) => {
            const rowId = getRowId(row, rowIndex);
            const selected = selectedRowIds?.has(rowId) ?? false;
            return (
              <TableRow
                key={rowId}
                data-state={selected ? "selected" : undefined}
                onClick={onBodyRowClick ? () => onBodyRowClick(row, rowIndex) : undefined}
                className={cn(
                  "group border-b-0 hover:bg-transparent",
                  onBodyRowClick && "cursor-pointer",
                  customStyling.customBodyRowStyles,
                  selected && customStyling.customBodyRowSelectedStyles,
                  rowClassName?.(row, rowIndex)
                )}
              >
                {columns.map((column, colIndex) => {
                  const frozen = frozenStyle(colIndex);
                  return (
                    <TableCell
                      key={column.id}
                      style={{ ...sizeStyle(column), ...frozen }}
                      className={cn(
                        "border-b border-foreground/[0.08] bg-background px-4 py-3",
                        H_ALIGN[column.horizontalAlign ?? defaultHorizontalAlign],
                        V_ALIGN[defaultRowVerticalAlign],
                        frozen && frozenShadow(colIndex),
                        selected && "bg-muted",
                        customStyling.customBodyColumnStyles,
                        selected && customStyling.customBodyColumnSelectedStyles,
                        customStylingFn?.customBodyColumnStylesFn?.(row, column.id, rowIndex),
                        cellClassName?.(row, column.id, rowIndex)
                      )}
                    >
                      {customStyling.customBodyContentContainerStyles ? (
                        <div className={customStyling.customBodyContentContainerStyles}>
                          {renderCell(column, row, rowIndex)}
                        </div>
                      ) : (
                        renderCell(column, row, rowIndex)
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>

        {isInlineFooter && children && <TableFooter>{children}</TableFooter>}
      </Table>
      {!isInlineFooter && children}
    </div>
  );
}

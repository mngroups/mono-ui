import type { HTMLAttributes, ReactNode } from "react";

export type SortDirection = "asc" | "desc" | false;
export type TableVerticalAlign = "top" | "middle" | "bottom";
export type TableHorizontalAlign = "left" | "center" | "right";

/** Granular per-element class overrides, passed via `customStyling`. */
export interface TableCustomStyling {
  /** Outermost wrapper div. */
  customContainerStyles?: string;
  /** Scrollable overflow div wrapping the `<table>`. */
  customTableContainerStyles?: string;
  /** The `<table>` element. */
  customTableStyles?: string;
  /** The `<thead>` element. */
  customHeaderStyles?: string;
  /** The header `<tr>`. */
  customHeaderRowStyles?: string;
  /** Inner content wrapper inside each header `<th>`. */
  customHeaderContentContainerStyles?: string;
  /** Every header `<th>`. */
  customHeaderColumnStyles?: string;
  /** The `<tbody>` element. */
  customBodyStyles?: string;
  /** Every body `<tr>`. */
  customBodyRowStyles?: string;
  /** Body `<tr>` when selected. */
  customBodyRowSelectedStyles?: string;
  /** Every body `<td>`. */
  customBodyColumnStyles?: string;
  /** Body `<td>` when selected. */
  customBodyColumnSelectedStyles?: string;
  /** Inner content wrapper inside each body `<td>`. */
  customBodyContentContainerStyles?: string;
}

/** Function-based class overrides, passed via `customStylingFn`. */
export interface TableCustomStylingFn<T = unknown> {
  /** Return an extra class string for a given body cell. */
  customBodyColumnStylesFn?: (row: T, columnId: string, rowIndex: number) => string | undefined;
}

/** One column of a `BaseTable` / `DataTable`. */
export interface TableColumn<T = unknown> {
  /** Unique column key; also the id passed to `onSort` and `cellClassName`. */
  id: string;
  /** Header content, or a function that renders it. */
  header: ReactNode | (() => ReactNode);
  /** Custom cell renderer. Wins over `accessorKey`. */
  cell?: (row: T, rowIndex: number) => ReactNode;
  /** Row field rendered as-is when there is no `cell`. */
  accessorKey?: keyof T & string;
  /** Fixed column width (CSS value or px). */
  width?: number | string;
  /** Minimum column width (CSS value or px). */
  minWidth?: number | string;
  /** Horizontal alignment for this column's header and cells. */
  horizontalAlign?: TableHorizontalAlign;
  /** Vertical alignment for this column's header cell specifically. */
  headerVerticalAlign?: TableVerticalAlign;
  /** Shows a sort toggle in the header (needs `onSort` on the table). */
  sortable?: boolean;
  /** If true, clicking the header doesn't toggle sorting even if `sortable`. */
  disableSortingTrigger?: boolean;
}

/** Props shared by `BaseTable` and `DataTable`. */
export interface TableProps<T = unknown> extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Column definitions, in display order. */
  columns: TableColumn<T>[];
  /** Rows to render. */
  data: T[];
  /** Whether the header sticks to the top while the body scrolls. */
  isStickyHeader?: boolean;
  /** Number of columns to freeze/pin on the left. */
  freezeLeftColCount?: number;
  /** Number of columns to freeze/pin on the right. */
  freezeRightColCount?: number;
  /** Default vertical alignment for all header cells. */
  defaultHeaderVerticalAlign?: TableVerticalAlign;
  /** Default vertical alignment for all body cells. */
  defaultRowVerticalAlign?: TableVerticalAlign;
  /** Default horizontal alignment for all columns. */
  defaultHorizontalAlign?: TableHorizontalAlign;
  /** Renders `children` inside the `<table>` as a `<tfoot>` instead of below. */
  isInlineFooter?: boolean;
  /** Granular per-element class overrides. */
  customStyling?: TableCustomStyling;
  /** Per-cell function-based class override. */
  customStylingFn?: TableCustomStylingFn<T>;
  /** Called with the row data when a body row is clicked. */
  onBodyRowClick?: (row: T, index: number) => void;
  /** Footer / extra content rendered below or inside the table (see `isInlineFooter`). */
  children?: ReactNode;
  /** Set of selected row IDs. */
  selectedRowIds?: Set<string>;
  /** Sort callback. Header clicks cycle asc → desc → off. */
  onSort?: (columnId: string, direction: SortDirection) => void;
  /** Id of the column currently sorted. */
  sortColumn?: string;
  /** Direction of the current sort; `false` means unsorted. */
  sortDirection?: SortDirection;
  /** Resolve a stable ID for each row. Falls back to `row.id` or the index. */
  getRowId?: (row: T, index: number) => string;
  /** `data-testid` on the outer wrapper. */
  dataTestId?: string;
  /** Return an extra class string for a given body row. */
  rowClassName?: (row: T, index: number) => string | undefined;
  /** Return an extra class string for a given body cell. */
  cellClassName?: (row: T, columnId: string, rowIndex: number) => string | undefined;
}

import type { HTMLAttributes } from "react";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Total number of items. */
  total: number;
  /** 1-based current page. */
  current?: number;
  /** Items per page. Defaults to 10. */
  pageSize?: number;
  /** Disables every button, e.g. while the next page is loading. */
  disabled?: boolean;
  /** Sets `data-testid` on the `<nav>`. */
  dataTestId?: string;
  /** Receives the 1-based page. */
  onChange?: (page: number) => void;
}

export type PageItem = number | "jump-back" | "jump-forward";

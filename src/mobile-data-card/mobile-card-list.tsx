"use client";

import { cn } from "@mono/utils";
import type { ReactNode } from "react";
import EmptyDataComponent from "../data-table/empty-data.js";
import { ListPagination } from "../list-toolbar/list-toolbar.js";
import { Skeleton } from "../ui/skeleton.js";

/** Pager settings for {@link MobileCardList}. */
export type MobileCardListPagination = {
  /** Total number of items across all pages. */
  total: number;
  /** Current page, 1-based. */
  page: number;
  /** Items per page. */
  pageSize: number;
  /** Called with the new page number. */
  onChange: (page: number) => void;
  /** Slice `items` here instead of expecting the caller to page server-side. */
  clientSide?: boolean;
};

function CardSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

/**
 * Mobile replacement for a paginated table: skeleton while loading, the shared
 * empty state when there is nothing, and the shared Pagination underneath so the
 * mobile and desktop pagers behave identically.
 */
export function MobileCardList<T>({
  items,
  isLoading,
  renderCard,
  keyOf,
  pagination,
  skeletonCount = 3,
  header,
  className,
}: {
  /** Items to render, already paged unless `pagination.clientSide`. */
  items: T[];
  /** Shows card skeletons instead of the list. */
  isLoading?: boolean;
  /** Renders one card, usually a `MobileDataCard`. */
  renderCard: (item: T, index: number) => ReactNode;
  /** Stable key per item — index keys make expand state jump on refetch. */
  keyOf: (item: T, index: number) => string;
  /** Shows the shared pager under the cards. */
  pagination?: MobileCardListPagination;
  /** Number of skeleton cards while loading. Default: 3. */
  skeletonCount?: number;
  /** Content above the first card, e.g. a result count. */
  header?: ReactNode;
  className?: string;
}) {
  if (isLoading) return <CardSkeleton count={skeletonCount} />;
  if (items.length === 0) return <EmptyDataComponent />;

  const visible =
    pagination?.clientSide === true
      ? items.slice(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize
        )
      : items;

  return (
    <div className={cn("space-y-3", className)}>
      {header}
      {visible.map((item, idx) => (
        <div key={keyOf(item, idx)}>{renderCard(item, idx)}</div>
      ))}
      {pagination && (
        <ListPagination
          total={pagination.total}
          page={pagination.page}
          pageSize={pagination.pageSize}
          onChange={pagination.onChange}
        />
      )}
    </div>
  );
}

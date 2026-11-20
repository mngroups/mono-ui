import { Skeleton } from "../ui/skeleton.js";
/**
 * Shimmer rows for a table that's still loading. Renders as many placeholder
 * rows as the page will eventually hold, so the content area keeps its height
 * and nothing shifts when the real rows land.
 */
export function TableSkeleton({
  rows = 10,
}: {
  /** Number of placeholder rows; match the page size. */
  rows?: number;
} = {}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 rounded-xl" />
      ))}
    </div>
  );
}

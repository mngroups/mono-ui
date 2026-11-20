import { Inbox } from "lucide-react";

/**
 * Compact "no rows" placeholder that sits inside a table body.
 *
 * Deliberately distinct from `DataNotAvailable`: that one is a full-page empty
 * state with a large illustration and a 420px floor, which would overwhelm a
 * table that's merely on an empty page of results.
 */
export function TableEmptyState({
  message = "Tidak ada data",
}: {
  /** Text under the icon. */
  message?: string;
} = {}) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
      <Inbox size={32} strokeWidth={1.5} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

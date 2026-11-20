"use client";

import { cn, formatIndonesianNumber } from "@mono/utils";
import { ChevronLeft, ChevronRight, ListFilter, Search, X } from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { DynamicModal } from "../dynamic-modal/dynamic-modal.js";
import { Pagination } from "../pagination/pagination.js";
import { Button } from "../ui/button.js";
import { Input } from "../ui/input.js";
import { PlainButton } from "../ui/plain-button.js";
import { PAGINATION_THEME } from "./pagination-theme.js";

/**
 * True when a flex-wrap row's last child has dropped below its first one.
 * Wrapping changes the row's height, so observing the row is enough.
 */
function useIsRowWrapped(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [wrapped, setWrapped] = useState(false);

  useEffect(() => {
    const row = ref.current;
    if (!enabled || !row || typeof ResizeObserver === "undefined") return;
    const check = () => {
      const first = row.firstElementChild as HTMLElement | null;
      const last = row.lastElementChild as HTMLElement | null;
      setWrapped(!!first && !!last && last.offsetTop > first.offsetTop);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(row);
    return () => observer.disconnect();
  }, [ref, enabled]);

  return enabled && wrapped;
}

/**
 * Pagination row under a list or table. Desktop shows the `Pagination` pager (plus an optional
 * "go to page" input); mobile (below `md`) collapses to Previous / page input / Next.
 * Renders nothing when everything fits on one page.
 */
export function ListPagination({
  total,
  page,
  pageSize,
  onChange,
  showJumper = false,
}: {
  /** Total number of items across all pages. */
  total: number;
  /** 1-based current page (controlled). */
  page: number;
  /** Items per page. */
  pageSize: number;
  /** Receives the 1-based page to show. */
  onChange: (page: number) => void;
  /** Desktop only: adds a "Ke halaman" input beside the page buttons. Mobile always has one. */
  showJumper?: boolean;
}) {
  // Hooks must be called unconditionally and in the same order on every
  // render. Initialize state and derived values before any early returns.
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [jumpValue, setJumpValue] = useState(String(page));

  // Keep the jumper input synced to the `page` prop. If the page changes
  // externally (e.g. data reload, external controls), reflect it in the input.
  useEffect(() => {
    setJumpValue(String(page));
  }, [page]);

  const hasPages = total > pageSize;
  const jumperRowRef = useRef<HTMLDivElement>(null);
  const jumperWrapped = useIsRowWrapped(jumperRowRef, showJumper && hasPages);

  if (!hasPages) return null;

  // Mobile input state for the page jumper. Keep it local so typing doesn't
  // immediately trigger a refetch until the user confirms (Enter or blur).
  const commitJump = () => {
    const n = Number.parseInt(jumpValue || "", 10);
    if (!Number.isFinite(n)) {
      setJumpValue(String(page));
      return;
    }
    const clamped = Math.min(Math.max(1, n), totalPages);
    if (clamped !== page) onChange(clamped);
    setJumpValue(String(clamped));
  };

  // Only one breakpoint's controls are visible at a time, so both jumpers can
  // share the same draft value.
  const jumpDigits = String(totalPages).length;
  const renderJumpInput = (className: string, style?: CSSProperties) => (
    <input
      aria-label="Halaman"
      // Text + numeric keypad instead of type="number": no spinner arrows, and
      // no accidental page change from scrolling over the field.
      type="text"
      inputMode="numeric"
      value={jumpValue}
      maxLength={jumpDigits}
      onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ""))}
      onKeyDown={(e) => {
        if (e.key === "Enter") commitJump();
      }}
      onBlur={commitJump}
      className={cn(
        "rounded-lg border border-foreground/10 bg-transparent text-center text-sm outline-none",
        className
      )}
      style={style}
    />
  );

  // Same pager in both desktop layouts, so a list with a jumper and one
  // without look identical.
  const pager = <Pagination total={total} current={page} pageSize={pageSize} onChange={onChange} />;

  return (
    <div className="w-full">
      {showJumper ? (
        // Desktop with jumper: pager left / jumper right; once the card is too
        // narrow and the jumper wraps, center both rows instead.
        <div
          ref={jumperRowRef}
          className={cn(
            "hidden flex-wrap items-center gap-x-6 gap-y-3 md:flex",
            jumperWrapped ? "justify-center" : "justify-between"
          )}
        >
          {pager}

          <div className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
            {/* Sized to the longest page number (+ px-2 padding and border) so
                5-digit pages aren't clipped. */}
            {renderJumpInput("h-6 px-2 tabular-nums", {
              width: `calc(${Math.max(2, jumpDigits)}ch + 1rem + 2px)`,
            })}
            <span className="text-foreground/60 tabular-nums">
              / {formatIndonesianNumber(totalPages)}
            </span>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex">{pager}</div>
      )}

      {/* Mobile: simplified controls — Previous | [page jumper] / total | Next */}
      <div
        className={cn(
          PAGINATION_THEME,
          "grid w-full grid-cols-[minmax(2.5rem,1fr)_auto_minmax(2.5rem,1fr)] items-center gap-1.5 min-[360px]:gap-2 md:hidden"
        )}
      >
        <PlainButton
          type="button"
          aria-label="Halaman sebelumnya"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-foreground/10 px-2 text-xs whitespace-nowrap disabled:opacity-50 min-[420px]:px-3 min-[420px]:text-sm"
        >
          <ChevronLeft size={16} className="shrink-0" />
          <span className="hidden min-[420px]:inline">Sebelumnya</span>
        </PlainButton>

        <div className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap">
          {renderJumpInput("h-10 w-11 px-1.5 min-[360px]:w-12 min-[420px]:w-14 min-[420px]:px-2")}
          <span className="text-xs text-foreground/60">/ {formatIndonesianNumber(totalPages)}</span>
        </div>

        <PlainButton
          type="button"
          aria-label="Halaman berikutnya"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-foreground/10 px-2 text-xs whitespace-nowrap disabled:opacity-50 min-[420px]:px-3 min-[420px]:text-sm"
        >
          <span className="hidden min-[420px]:inline">Berikutnya</span>
          <ChevronRight size={16} className="shrink-0" />
        </PlainButton>
      </div>
    </div>
  );
}

/**
 * Search box used by {@link ListToolbar}: search icon, clear button, and
 * Escape to clear.
 */
export function ListSearchInput({
  value,
  onChange,
  label,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Accessible label, also used as the placeholder. */
  label: string;
  testId?: string;
}) {
  return (
    <div role="search" className="relative w-full min-w-0 lg:w-72 lg:shrink-0">
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={label ?? "Cari"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) onChange("");
        }}
        data-testid={testId}
        className="h-10 pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <PlainButton
          type="button"
          aria-label="Hapus pencarian"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
        >
          <X size={14} />
        </PlainButton>
      )}
    </div>
  );
}

/**
 * Filters held back until the user confirms. One commit per apply instead of
 * one per tap — on mobile that is the difference between a single refetch and
 * one for every checkbox.
 */
export type ListToolbarDraft<T> = {
  /** Currently committed values — the draft resets to these each time the sheet opens. */
  values: T;
  onApply: (values: T) => void;
  render: (draft: T, setDraft: (next: T) => void) => ReactNode;
  /** Value the sheet's Reset button falls back to. Without it Reset commits `onResetFilters`. */
  emptyValues?: T;
};

type ListToolbarProps<T> = {
  /** Search text (controlled). */
  search?: string;
  /** Shows the search box when set. */
  onSearchChange?: (value: string) => void;
  /** Search box label and placeholder. Default: "Cari". */
  searchLabel?: string;
  searchTestId?: string;
  /**
   * Filter controls. Called with `inSheet: false` for the desktop row and
   * `inSheet: true` for the mobile sheet, where each control should be
   * `fullWidth` and open its own nested sheet.
   */
  filters?: (inSheet: boolean) => ReactNode;
  /** Mobile sheet filters with draft semantics. Falls back to `filters(true)`. */
  draft?: ListToolbarDraft<T>;
  /** Number shown on the mobile filter trigger's badge. */
  activeFilterCount?: number;
  /** Whether anything is resettable — defaults to "a filter is active", but a
   * caller whose search also resets can widen it. */
  canReset?: boolean;
  /** Called by the Reset buttons. */
  onResetFilters?: () => void;
  /** Primary action (e.g. the add button). */
  action?: ReactNode;
  /**
   * Mobile trigger shape. "icon" is a square icon button (sits beside a search
   * box or a row of chips); "block" fills its container and adds the "Filter"
   * label (stands on its own above a list).
   */
  trigger?: "icon" | "block";
  /** Label for the block trigger. */
  triggerLabel?: string;
  /** Prefix for the generated data-testids. */
  testIdPrefix?: string;
  className?: string;
};

/**
 * List toolbar. On desktop the filters sit inline next to the search box; on
 * mobile the search box shares one row with a filter trigger (badged with the
 * active filter count) and the primary action, and every filter moves into a
 * single bottom sheet so they don't stack four rows tall.
 */
export function ListToolbar<T>({
  search,
  onSearchChange,
  searchLabel = "Cari",
  searchTestId,
  filters,
  draft,
  activeFilterCount = 0,
  canReset = activeFilterCount > 0,
  onResetFilters,
  action,
  trigger = "icon",
  triggerLabel = "Filter",
  testIdPrefix = "list-toolbar",
  className,
}: ListToolbarProps<T>) {
  const [sheetOpen, setSheetOpen] = useState(false);
  // The sheet's contents (searchable dropdowns with infinite scroll) are heavy;
  // don't mount them on pages where the user never opens the filters.
  const [hasOpened, setHasOpened] = useState(false);
  const [draftValues, setDraftValues] = useState(draft?.values);

  // Seed the draft from the committed values when the sheet opens, and only
  // then. Callers pass `draft.values` as an object literal, so syncing on its
  // identity would overwrite the user's picks on every re-render.
  const committedRef = useRef(draft?.values);
  committedRef.current = draft?.values;
  useEffect(() => {
    if (sheetOpen) setDraftValues(committedRef.current);
  }, [sheetOpen]);

  const hasFilters = Boolean(filters || draft);

  // Mount first, open on the next commit — a drawer mounted already-open skips
  // its slide-in animation. Once mounted the trigger opens it directly.
  useEffect(() => {
    if (hasOpened) setSheetOpen(true);
  }, [hasOpened]);

  const openSheet = () => {
    if (hasOpened) setSheetOpen(true);
    else setHasOpened(true);
  };

  const applyDraft = () => {
    if (draft && draftValues !== undefined) draft.onApply(draftValues);
    setSheetOpen(false);
  };

  // The mobile/desktop split is expressed in CSS, not via useIsMobile: that hook
  // reports desktop on the first render, so a JS branch would paint the stacked
  // desktop toolbar on phones until hydration landed. The split sits at `lg`:
  // on tablets (md, with the sidebar rail) the inline dropdowns wrapped into a
  // ragged second row, so they keep the compact search + filter-sheet layout.
  return (
    <div className={cn("flex items-center gap-2 lg:gap-3", className)}>
      {onSearchChange && (
        // flex: SearchBar's root is inline-flex, which would sit on a text line box.
        <div className="flex min-w-0 flex-1 lg:flex-none">
          <ListSearchInput
            value={search ?? ""}
            onChange={onSearchChange}
            label={searchLabel}
            testId={searchTestId}
          />
        </div>
      )}

      {hasFilters && (
        <>
          <PlainButton
            type="button"
            onClick={openSheet}
            aria-label="Buka filter"
            data-testid={`${testIdPrefix}-filter-trigger`}
            className={cn(
              "relative flex h-10 items-center justify-center rounded-lg border border-foreground/15 text-foreground/70 transition-colors lg:hidden",
              trigger === "block" ? "w-full gap-2 px-3 text-sm" : "w-10 shrink-0",
              activeFilterCount > 0 && "border-primary/40 bg-primary/5 text-primary"
            )}
          >
            <ListFilter size={18} />
            {trigger === "block" && <span>{triggerLabel}</span>}
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </PlainButton>

          {filters && (
            <div className="hidden flex-wrap items-center gap-2 lg:flex [&>button]:h-10">
              {filters(false)}
            </div>
          )}
        </>
      )}

      {/* Desktop only: below lg the filter sheet has its own Reset and the trigger's
          badge shows active filters; inline, it squeezed the search box off the row. */}
      {canReset && (
        <Button
          type="button"
          variant="ghost"
          onClick={onResetFilters}
          data-testid={`${testIdPrefix}-reset-filter-button`}
          className="hidden lg:inline-flex"
        >
          <X size={14} className="mr-1" />
          Reset
        </Button>
      )}

      {action && <div className="lg:ml-auto">{action}</div>}

      {hasFilters && hasOpened && (
        <DynamicModal open={sheetOpen} onOpenChange={setSheetOpen} title="Filter" dismissible>
          {/* Two-up grid of dropdown triggers, each opening its own nested
              sheet — same shape as the PIC BC alert filter. */}
          <div className="scrollbar-modern grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto px-1 pb-2">
            {draft && draftValues !== undefined
              ? draft.render(draftValues, setDraftValues)
              : filters?.(true)}
          </div>
          <div className="flex gap-3">
            {canReset && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={
                  draft?.emptyValues !== undefined
                    ? () => setDraftValues(draft.emptyValues)
                    : onResetFilters
                }
                data-testid={`${testIdPrefix}-sheet-reset-button`}
              >
                Reset
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={draft ? applyDraft : () => setSheetOpen(false)}
              data-testid={`${testIdPrefix}-sheet-apply-button`}
            >
              {draft ? "Terapkan" : "Lihat hasil"}
            </Button>
          </div>
        </DynamicModal>
      )}
    </div>
  );
}

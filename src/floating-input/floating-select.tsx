"use client";

import { useIsMobile } from "@mono/hooks";
import { cn } from "@mono/utils";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { DynamicModal } from "../dynamic-modal/dynamic-modal.js";
import { FormField, FormItem, FormMessage } from "../ui/form.js";
import { PlainButton } from "../ui/plain-button.js";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select.js";
import { Skeleton } from "../ui/skeleton.js";

export interface SelectOption<TExtra = unknown> {
  label: string;
  value: string;
  extra?: TExtra;
}

type BaseSelectProps = Omit<
  React.ComponentPropsWithoutRef<typeof Select>,
  "value" | "defaultValue" | "onValueChange" | "open" | "onOpenChange"
>;

interface FloatingSelectProps<T extends FieldValues, TExtra = unknown> extends BaseSelectProps {
  /** `control` from the surrounding `useForm()`. */
  control: Control<T>;
  /** Field path in the form values; the field holds the picked option's `value`. */
  name: Path<T>;
  /** Text that floats into the border once a value is picked or the list is open. */
  label: string;
  /** Options to pick from; `extra` carries any payload you need back in `onOptionSelect`. */
  options: SelectOption<TExtra>[];
  /** Called with the whole option (including `extra`) when the user picks one. */
  onOptionSelect?: (option: SelectOption<TExtra>) => void;
  /** Node shown inside the trigger on the left. */
  prefix?: React.ReactNode;
  /** Node shown inside the trigger on the right. */
  suffix?: React.ReactNode;
  /** Use a plain placeholder instead of the floating label. */
  disableFloating?: boolean;
  /** Show skeleton rows in the list while options are being fetched. */
  loading?: boolean;
  /** More pages exist: scrolling to the end of the list calls `onLoadMore`. */
  hasMore?: boolean;
  /** Fetch the next page of options (infinite scroll). */
  onLoadMore?: () => void;
  /** Show a search box at the top of the list. */
  searchable?: boolean;
  /** Placeholder of the search box. */
  searchPlaceholder?: string;
  /**
   * Server-side search: called with the debounced keyword. When set, the list is
   * not filtered locally; pass the server's results as `options`.
   */
  onSearchChange?: (keyword: string) => void;
  /** Debounce for `onSearchChange`, in ms. */
  searchDebounce?: number;
  /** `data-testid` for the trigger. */
  testId?: string;
}

const OPTION_SKELETON_WIDTHS = ["w-3/4", "w-1/2", "w-2/3"];

/** Shimmer rows in the option list's row shape while options load. */
function OptionsSkeleton({ rowClassName }: { rowClassName: string }) {
  return (
    <div role="status" aria-label="Memuat opsi">
      {OPTION_SKELETON_WIDTHS.map((width) => (
        <div key={width} className={rowClassName}>
          <Skeleton className={cn("h-5 rounded", width)} />
        </div>
      ))}
    </div>
  );
}

/**
 * Single select with a floating label, wired to a react-hook-form field. Opens a
 * dropdown on desktop and a bottom sheet (`DynamicModal`) on mobile. Supports
 * local or server-side search, loading skeletons and infinite scroll.
 * Must be rendered inside `Form`.
 */
export function FloatingSelect<T extends FieldValues, TExtra = unknown>({
  control,
  name,
  label,
  options,
  onOptionSelect,
  prefix,
  suffix,
  disableFloating = false,
  loading = false,
  hasMore = false,
  onLoadMore,
  searchable = false,
  searchPlaceholder = "Cari...",
  onSearchChange,
  searchDebounce = 400,
  testId,
  ...selectProps
}: FloatingSelectProps<T, TExtra>) {
  const fieldId = String(name);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  // Which side Radix popper placed the dropdown on — drives which corners of
  // the trigger/content get flattened so the two read as one joined box.
  const [dropSide, setDropSide] = useState<"top" | "bottom">("bottom");
  // Only show the "no more data" hint once the list actually overflows the
  // popup viewport — for short lists there's nothing to scroll, so the hint
  // would just be noise.
  const [overflowing, setOverflowing] = useState(false);
  // The last picked option. Server-side search swaps `options` out (and closing
  // the dropdown resets the keyword), so the picked item can vanish from the
  // list — keep it around so the trigger still shows its label.
  const [pickedOption, setPickedOption] = useState<SelectOption<TExtra> | null>(null);

  const viewportRef = useRef<HTMLElement | null>(null);
  const isLockedRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const visibleOptions = React.useMemo(() => {
    if (!searchable || onSearchChange) return options;
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, search, searchable, onSearchChange]);

  useEffect(() => {
    if (!searchable) return;
    const timeout = setTimeout(() => {
      onSearchChange?.(search.trim());
    }, searchDebounce);
    return () => clearTimeout(timeout);
  }, [search, searchable, onSearchChange, searchDebounce]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const maybeLoadMore = useCallback(() => {
    if (!hasMore || loading || isLockedRef.current) return;
    isLockedRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onLoadMore?.();
    }, 200);
  }, [hasMore, loading, onLoadMore]);

  const tryLoadMore = useCallback(() => {
    const viewport = viewportRef.current;
    /* v8 ignore if -- @preserve ref null-check: only runs as the viewport's scroll listener, after the ref is set */
    if (!viewport) return;
    if (viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight >= 20) return;
    maybeLoadMore();
  }, [maybeLoadMore]);

  useEffect(() => {
    if (!loading) isLockedRef.current = false;
  }, [loading]);

  // Recompute whether the option list overflows the viewport whenever the
  // options change, so the "no more data" hint only renders for scrollable lists.
  useEffect(() => {
    if (!open) return;
    const check = () => {
      const viewport = viewportRef.current;
      setOverflowing(!!viewport && viewport.scrollHeight > viewport.clientHeight);
    };
    const frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, [visibleOptions, loading, open]);

  // When the option list re-renders after a search (results loading/arriving),
  // Radix Select pulls focus onto an item and steals it from the search input.
  // Restore focus so typing/selecting keeps working after the first search.
  useEffect(() => {
    if (!open || !searchable || isMobile) return;
    const input = searchInputRef.current;
    if (input && document.activeElement !== input) {
      input.focus({ preventScroll: true });
    }
  }, [visibleOptions, loading, open, searchable, isMobile]);

  const attachScrollListener = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      // Radix positions the popper (and stamps data-side) after mount, so read
      // it on the next frame.
      requestAnimationFrame(() => {
        setDropSide(node.getAttribute("data-side") === "top" ? "top" : "bottom");
      });
      const viewport = node.querySelector("[data-radix-select-viewport]") as HTMLElement;
      if (!viewport) return;
      viewportRef.current = viewport;
      viewport.addEventListener("scroll", tryLoadMore);
      return () => {
        viewport.removeEventListener("scroll", tryLoadMore);
      };
    },
    [tryLoadMore]
  );

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight >= 20) return;
    maybeLoadMore();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      onSearchChange?.("");
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const hasValue = field.value !== undefined && field.value !== "";
        const shouldFloat = !disableFloating && (hasValue || open);
        const selectedLabel =
          options.find((opt) => opt.value === field.value)?.label ??
          (pickedOption?.value === field.value ? pickedOption.label : "");

        const searchInput = searchable ? (
          <input
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
          />
        ) : null;

        return (
          <FormItem className="space-y-1">
            {/* min-w-0: FormItem is a grid; without it this item sizes to the
                selected label's max-content and overflows the card. */}
            <div className="relative flex h-12 min-w-0">
              {/* Notch border — fieldset owns the border, legend cuts it at the label */}
              <fieldset
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 m-0 min-w-0 border p-0",
                  !open && "rounded-xl",
                  open &&
                    (dropSide === "top"
                      ? "rounded-t-none rounded-b-xl"
                      : "rounded-t-xl rounded-b-none"),
                  hasError ? "border-destructive" : open ? "border-primary" : "border-border"
                )}
              >
                {!disableFloating && (
                  <legend
                    className={cn(
                      "invisible inline-block h-px overflow-hidden text-xs leading-none whitespace-nowrap select-none",
                      "transition-[max-width] duration-200 ease-out",
                      shouldFloat ? "max-w-full px-2" : "max-w-[0.01px]",
                      prefix ? "ml-9" : "ml-2"
                    )}
                  >
                    {label}
                  </legend>
                )}
              </fieldset>

              {prefix && (
                <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground">
                  {prefix}
                </div>
              )}

              {isMobile ? (
                <>
                  <PlainButton
                    id={fieldId}
                    type="button"
                    disabled={selectProps.disabled}
                    onClick={() => setOpen(true)}
                    className={cn(
                      "flex h-full w-full items-center justify-between rounded-xl bg-transparent text-sm",
                      "outline-none disabled:cursor-not-allowed disabled:opacity-60",
                      prefix ? "pl-10" : "pl-4",
                      suffix ? "pr-10" : "pr-4"
                    )}
                  >
                    <span className="truncate">
                      {selectedLabel || (disableFloating ? label : "")}
                    </span>
                    {!suffix && (
                      <ChevronDown
                        size={16}
                        className={cn(
                          "shrink-0 text-muted-foreground transition-transform",
                          open && "rotate-180"
                        )}
                      />
                    )}
                  </PlainButton>

                  <DynamicModal
                    open={open}
                    onOpenChange={handleOpenChange}
                    title={label}
                    dismissible
                  >
                    <div className="space-y-2">
                      {searchInput}
                      <div
                        data-vaul-no-drag
                        onScroll={handleMobileScroll}
                        className="scrollbar-modern -mx-1 max-h-[60vh] space-y-1 overflow-y-auto p-1"
                      >
                        {visibleOptions.map((opt) => {
                          const active = field.value === opt.value;
                          return (
                            <PlainButton
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                field.onChange(opt.value);
                                setPickedOption(opt);
                                onOptionSelect?.(opt);
                                handleOpenChange(false);
                              }}
                              className={cn(
                                "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                                active
                                  ? "bg-foreground/10 text-foreground"
                                  : "text-foreground/80 hover:bg-foreground/10 hover:text-foreground"
                              )}
                            >
                              <span>{opt.label}</span>
                              {active && <Check size={16} className="shrink-0 text-primary" />}
                            </PlainButton>
                          );
                        })}

                        {loading && <OptionsSkeleton rowClassName="px-3 py-2.5" />}

                        {!loading && visibleOptions.length === 0 && (
                          <div className="py-3 text-center text-sm text-muted-foreground">
                            Tidak ada data
                          </div>
                        )}
                      </div>
                    </div>
                  </DynamicModal>
                </>
              ) : (
                <Select
                  {...selectProps}
                  value={field.value}
                  onValueChange={(val) => {
                    // Radix reports "" when a programmatic value (reset, draft restore)
                    // lands before its native options mount; no item can be "".
                    if (val === "") return;
                    field.onChange(val);
                    const selected = visibleOptions.find((opt) => opt.value === val);
                    if (!selected) return;
                    setPickedOption(selected);
                    onOptionSelect?.(selected);
                  }}
                  open={open}
                  onOpenChange={handleOpenChange}
                >
                  <SelectTrigger
                    id={fieldId}
                    data-testid={testId}
                    style={{ height: "100%" }}
                    className={cn(
                      "w-full min-w-0 rounded-xl border-none bg-transparent text-sm shadow-none",
                      "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                      prefix ? "pl-10" : "pl-4",
                      suffix ? "pr-10" : "pr-4"
                    )}
                  >
                    {/* Render the label ourselves from the options lookup instead of
                        Radix's <SelectValue>, which goes blank when the selected item
                        isn't in the current (post-search) option list. */}
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-left",
                        !selectedLabel && "text-muted-foreground"
                      )}
                    >
                      {selectedLabel || (disableFloating ? label : "")}
                    </span>
                  </SelectTrigger>

                  <SelectContent
                    ref={attachScrollListener}
                    className={cn(
                      "mb-3 max-h-80 w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] bg-popover",
                      "data-[side=bottom]:mb-4 data-[side=top]:mt-4",
                      open
                        ? "data-[side=bottom]:rounded-t-none data-[side=bottom]:rounded-b-xl data-[side=top]:rounded-t-xl data-[side=top]:rounded-b-none"
                        : "rounded-xl"
                    )}
                    position="popper"
                  >
                    {searchable && (
                      <div className="sticky -top-2 z-10 bg-popover p-2">{searchInput}</div>
                    )}

                    {visibleOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="items-start rounded-lg whitespace-normal [&>span:last-child]:break-words"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}

                    {loading && <OptionsSkeleton rowClassName="py-1.5 pr-8 pl-2" />}

                    {!hasMore && !loading && visibleOptions.length > 0 && overflowing && (
                      <div className="py-1.5 text-center text-[10px] text-muted-foreground/50">
                        Tidak ada data lagi
                      </div>
                    )}

                    {!loading && visibleOptions.length === 0 && (
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        Tidak ada data
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}

              {!disableFloating && (
                <label
                  htmlFor={fieldId}
                  className={cn(
                    "pointer-events-none absolute z-10 px-1 leading-none select-none",
                    "transition-all duration-200 ease-out",
                    prefix ? "left-10" : "left-3",
                    shouldFloat
                      ? "top-0 -translate-y-1/2 text-xs"
                      : "top-1/2 -translate-y-1/2 text-sm",
                    hasError ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {label}
                </label>
              )}

              {suffix && (
                <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-muted-foreground">
                  {suffix}
                </div>
              )}
            </div>

            <FormMessage className="text-xs" />
          </FormItem>
        );
      }}
    />
  );
}

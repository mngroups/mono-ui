"use client";

import { useIsMobile } from "@mono/hooks";
import { cn } from "@mono/utils";
import { ChevronDown, Search } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { DynamicModal } from "../dynamic-modal/dynamic-modal.js";
import { Checkbox } from "../ui/checkbox.js";
import { FormField, FormItem, FormMessage } from "../ui/form.js";
import { PlainButton } from "../ui/plain-button.js";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.js";
import { Skeleton } from "../ui/skeleton.js";

export interface MultiSelectOption {
  label: string;
  value: string;
}

/** A full-width option row: shadcn Checkbox plus its label. */
function CheckboxRow({
  checked,
  onChange,
  disabled,
  className,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} disabled={disabled} />
      {children}
    </label>
  );
}

/** Sentinel value meaning "all" (API accepts `["all"]`). */
export const SELECT_ALL_VALUE = "all";

interface FloatingMultiSelectProps<T extends FieldValues> {
  /** `control` from the surrounding `useForm()`. */
  control: Control<T>;
  /** Field path in the form values; the field holds a `string[]` of picked values. */
  name: Path<T>;
  /** Text that floats into the border once something is picked or the list is open. */
  label: string;
  /** Noun used in the trigger text, e.g. "Site" → "3 Site Terpilih". */
  noun: string;
  /** Options to pick from. */
  options: MultiSelectOption[];
  /** Placeholder of the search box at the top of the list. */
  searchPlaceholder?: string;
  /** Show a "Pilih Semua" row that maps the value to `["all"]`. */
  allowSelectAll?: boolean;
  /** Show skeleton rows in the list while options are being fetched. */
  loading?: boolean;
  /** Disable the trigger. */
  disabled?: boolean;
}

const OPTION_SKELETON_WIDTHS = ["w-3/4", "w-1/2", "w-2/3"];

/** Shimmer checkbox rows in the option list's row shape while options load. */
function OptionsSkeleton() {
  return (
    <div role="status" aria-label="Memuat opsi">
      {OPTION_SKELETON_WIDTHS.map((width) => (
        <div key={width} className="flex items-center gap-2 px-3 py-2.5">
          <Skeleton className="size-4 shrink-0 rounded" />
          <Skeleton className={cn("h-5 rounded", width)} />
        </div>
      ))}
    </div>
  );
}

/**
 * Checkbox multi-select with a floating label and a search box, wired to a
 * react-hook-form field holding `string[]`. The trigger summarises the pick
 * ("3 Site Terpilih"). Opens a popover on desktop and a bottom sheet on mobile.
 * Must be rendered inside `Form`.
 */
export function FloatingMultiSelect<T extends FieldValues>({
  control,
  name,
  label,
  noun,
  options,
  searchPlaceholder = "Cari",
  allowSelectAll = false,
  loading = false,
  disabled = false,
}: FloatingMultiSelectProps<T>) {
  const fieldId = String(name);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value: string[] = Array.isArray(field.value) ? field.value : [];
        const isAll = value.length === 1 && value[0] === SELECT_ALL_VALUE;
        const selectedCount = isAll ? options.length : value.length;
        // "Semua" still shows a trigger label even when the option list is empty.
        const hasValue = isAll || selectedCount > 0;
        const hasError = !!fieldState.error;
        const shouldFloat = hasValue || open;

        const triggerText = isAll
          ? `Semua ${noun}`
          : hasValue
            ? `${value.length} ${noun} Terpilih`
            : "";

        const toggleOption = (optValue: string) => {
          // Editing individuals is locked while "Semua" is on.
          /* v8 ignore if -- @preserve the option checkboxes are disabled while "Semua" is on */
          if (isAll) return;
          const next = value.includes(optValue)
            ? value.filter((v) => v !== optValue)
            : [...value, optValue];
          field.onChange(next);
        };

        const toggleAll = () => {
          field.onChange(isAll ? [] : [SELECT_ALL_VALUE]);
        };

        const triggerInner = (
          <>
            <span className="truncate">{triggerText}</span>
            <ChevronDown
              size={16}
              className={cn(
                "shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </>
        );

        const triggerClassName = cn(
          "flex h-full w-full items-center justify-between rounded-xl bg-transparent px-4 text-left text-sm",
          "outline-none disabled:cursor-not-allowed disabled:opacity-60"
        );

        const searchBar = (
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-border bg-background py-2 pr-9 pl-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <Search
              size={16}
              className="absolute top-3 right-3 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        );

        const optionsList = (
          <>
            {allowSelectAll && (
              <CheckboxRow checked={isAll} onChange={toggleAll} className="hover:bg-foreground/10">
                <span className="font-medium">Pilih Semua</span>
              </CheckboxRow>
            )}

            {loading ? (
              <OptionsSkeleton />
            ) : filtered.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">Tidak ada data</div>
            ) : (
              filtered.map((opt) => {
                const checked = isAll || value.includes(opt.value);
                return (
                  <CheckboxRow
                    key={opt.value}
                    checked={checked}
                    onChange={() => toggleOption(opt.value)}
                    disabled={isAll}
                    className={cn(!isAll && "hover:bg-foreground/10")}
                  >
                    <span className="truncate">{opt.label}</span>
                  </CheckboxRow>
                );
              })
            )}
          </>
        );

        return (
          <FormItem className="space-y-1">
            <div className="relative flex h-12">
              <fieldset
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 m-0 min-w-0 border p-0",
                  open ? "rounded-t-xl rounded-b-none" : "rounded-xl",
                  hasError ? "border-destructive" : open ? "border-primary" : "border-border"
                )}
              >
                <legend
                  className={cn(
                    "invisible inline-block h-px overflow-hidden text-xs leading-none whitespace-nowrap select-none",
                    "transition-[max-width] duration-200 ease-out",
                    shouldFloat ? "ml-2 max-w-full px-2" : "ml-2 max-w-[0.01px]"
                  )}
                >
                  {label}
                </legend>
              </fieldset>

              {isMobile ? (
                <>
                  <PlainButton
                    id={fieldId}
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen(true)}
                    className={triggerClassName}
                  >
                    {triggerInner}
                  </PlainButton>

                  <DynamicModal
                    open={open}
                    onOpenChange={handleOpenChange}
                    title={label}
                    dismissible
                  >
                    <div className="space-y-2">
                      {searchBar}
                      <div className="scrollbar-modern -mx-1 max-h-[60vh] overflow-y-auto p-1">
                        {optionsList}
                      </div>
                    </div>
                  </DynamicModal>
                </>
              ) : (
                <Popover open={open} onOpenChange={handleOpenChange}>
                  <PopoverTrigger
                    id={fieldId}
                    type="button"
                    disabled={disabled}
                    className={triggerClassName}
                  >
                    {triggerInner}
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    sideOffset={0}
                    className="w-[var(--radix-popover-trigger-width)] rounded-t-none rounded-b-xl border-border p-0"
                  >
                    <div className="border-b border-foreground/10 p-2">{searchBar}</div>
                    <div className="scrollbar-modern max-h-64 overflow-y-auto p-1">
                      {optionsList}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              <label
                htmlFor={fieldId}
                className={cn(
                  "pointer-events-none absolute z-10 px-1 leading-none select-none",
                  "left-3 transition-all duration-200 ease-out",
                  shouldFloat
                    ? "top-0 -translate-y-1/2 text-xs"
                    : "top-1/2 -translate-y-1/2 text-sm",
                  hasError ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {label}
              </label>
            </div>

            <FormMessage className="text-xs" />
          </FormItem>
        );
      }}
    />
  );
}

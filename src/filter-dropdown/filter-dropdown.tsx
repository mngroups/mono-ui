"use client";

import { useIsMobile } from "@mono/hooks";
import { cn } from "@mono/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DynamicModal } from "../dynamic-modal/dynamic-modal.js";
import { PlainButton } from "../ui/plain-button.js";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.js";

/** One option of a filter dropdown. */
export interface FilterDropdownOption {
  value: string;
  label: string;
}

interface MultiSelectOptionDropdownProps {
  /** Trigger text and the panel's search placeholder. */
  label: string;
  options: FilterDropdownOption[];
  /** Selected option values. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Stretch the trigger to fill its container (used inside the mobile sheet). */
  fullWidth?: boolean;
  /** Show a "Pilih semua" action that selects every option. */
  showSelectAll?: boolean;
  /** Greys out the trigger and blocks opening the panel. */
  disabled?: boolean;
  /**
   * `"inline"` drops the popover/sheet and renders a collapsible section in
   * place — used inside a bottom sheet, where a nested drawer would stack two
   * overlays and two grab handles.
   */
  variant?: "dropdown" | "inline";
  testId?: string;
}

const OPTIONS_PAGE_SIZE = 30;

/**
 * Multi-select dropdown for server-side filters (values sent as repeated query
 * params). Supports search + infinite scroll for large option lists.
 *
 * A popover on desktop and a bottom sheet on mobile; the trigger shows a badge
 * with the number of selected options.
 */
export function MultiSelectOptionDropdown({
  label,
  options,
  value,
  onChange,
  fullWidth = false,
  showSelectAll = false,
  disabled = false,
  variant = "dropdown",
  testId,
}: MultiSelectOptionDropdownProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(OPTIONS_PAGE_SIZE);

  const q = search.toLowerCase();
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q));
  const activeCount = value.length;

  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  const [pinnedSelected, setPinnedSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (open) setPinnedSelected(new Set(value));
  }, [open, value]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `filtered` is derived from `options` and `search`, the real keys
  const ordered = useMemo(() => {
    const selected: FilterDropdownOption[] = [];
    const rest: FilterDropdownOption[] = [];
    for (const o of filtered) (pinnedSelected.has(o.value) ? selected : rest).push(o);
    return [...selected, ...rest];
  }, [options, search, pinnedSelected]);

  // Reset the render window when the search changes or the dropdown reopens.
  useEffect(() => {
    setVisibleCount(OPTIONS_PAGE_SIZE);
  }, [search, open]);

  // Infinite scroll: reveal more options as the list nears the bottom.
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      setVisibleCount((c) => (c < ordered.length ? c + OPTIONS_PAGE_SIZE : c));
    }
  };

  const visibleOptions = ordered.slice(0, visibleCount);

  const trigger = (
    <PlainButton
      type="button"
      onClick={isMobile ? () => setOpen(true) : undefined}
      disabled={disabled}
      data-testid={testId}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-foreground/15 px-3 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/[0.03] md:py-1.5",
        fullWidth ? "w-full justify-between" : "shrink-0",
        activeCount > 0 && "border-primary/40 bg-primary/5 text-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
      )}
    >
      <span className="truncate">{label}</span>
      <span className="flex items-center gap-1.5">
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
        <ChevronDown size={14} className="text-foreground/40" />
      </span>
    </PlainButton>
  );

  const header = (
    <div className="p-3">
      <div className="flex items-center gap-2 rounded-lg border border-foreground/15 px-2.5 py-2.5 md:py-1.5">
        <Search size={13} className="shrink-0 text-foreground/40" />
        <input
          type="text"
          placeholder={`Cari ${label.toLowerCase()}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40 md:text-xs"
        />
        {search && (
          <PlainButton type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian">
            <X size={12} className="text-foreground/40 hover:text-foreground" />
          </PlainButton>
        )}
      </div>
      {(activeCount > 0 || showSelectAll) && (
        <div className="mt-2 flex items-center gap-3">
          {showSelectAll && activeCount < options.length && (
            <PlainButton
              type="button"
              onClick={() => onChange(options.map((o) => o.value))}
              className="text-xs font-medium text-primary hover:text-primary-strong"
            >
              Pilih semua
            </PlainButton>
          )}
          {activeCount > 0 && (
            <PlainButton
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-primary hover:text-primary-strong"
            >
              Hapus semua
            </PlainButton>
          )}
        </div>
      )}
    </div>
  );

  const list = (maxHeight: string) => (
    <div
      className={cn("overflow-y-auto border-t border-foreground/10", maxHeight)}
      onScroll={handleScroll}
    >
      {filtered.length === 0 ? (
        <p className="px-3 py-4 text-center text-xs text-foreground/40">Tidak ditemukan</p>
      ) : (
        visibleOptions.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <PlainButton
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-foreground/[0.03] md:px-3 md:py-2.5"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border md:h-4 md:w-4",
                  checked ? "border-primary bg-primary text-white" : "border-foreground/30"
                )}
              >
                {checked && <Check size={12} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1 text-[15px] break-words text-foreground md:text-sm">
                {opt.label}
              </span>
            </PlainButton>
          );
        })
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-foreground/15",
          activeCount > 0 && "border-primary/40"
        )}
      >
        <PlainButton
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={disabled}
          data-testid={testId}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm"
        >
          <span className="font-medium text-foreground">{label}</span>
          <span className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
            <ChevronDown
              size={16}
              className={cn("text-foreground/40 transition-transform", open && "rotate-180")}
            />
          </span>
        </PlainButton>
        {open && (
          <>
            {header}
            {list("max-h-56")}
          </>
        )}
      </div>
    );
  }

  // Mobile: render the panel as a bottom sheet instead of a popover.
  if (isMobile) {
    return (
      <>
        {trigger}
        <DynamicModal open={open} onOpenChange={setOpen} title={label} dismissible>
          <div className="-mx-4 -mb-2">
            {header}
            {list("max-h-[55vh]")}
          </div>
        </DynamicModal>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-56 border-foreground/10 bg-popover p-0 shadow-2xl shadow-black/20"
        align="start"
      >
        {header}
        {list("max-h-48")}
      </PopoverContent>
    </Popover>
  );
}

interface SingleSelectOptionDropdownProps {
  /** Trigger text while nothing is selected, and the search placeholder. */
  label: string;
  options: FilterDropdownOption[];
  /** Selected option value. */
  value: string | null;
  onChange: (next: string) => void;
  /** Stretch the trigger to fill its container (used inside the mobile sheet). */
  fullWidth?: boolean;
  /**
   * Value that counts as "no filter" (e.g. "semua"). Selecting anything else
   * shows the active badge, matching the multi-select trigger.
   */
  neutralValue?: string | null;
  /** The trigger button's `data-testid`. */
  testId?: string;
}

/**
 * Single-select (radio) variant of {@link MultiSelectOptionDropdown}. Selecting
 * an option replaces the current value and closes the panel. Shares the search +
 * infinite-scroll behaviour for large option lists.
 */
export function SingleSelectOptionDropdown({
  label,
  options,
  value,
  onChange,
  fullWidth = false,
  neutralValue = null,
  testId,
}: SingleSelectOptionDropdownProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(OPTIONS_PAGE_SIZE);

  const q = search.toLowerCase();
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q));
  const selectedOption = options.find((o) => o.value === value) ?? null;
  const isActive = selectedOption != null && value !== neutralValue;

  useEffect(() => {
    setVisibleCount(OPTIONS_PAGE_SIZE);
  }, [search, open]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      setVisibleCount((c) => (c < filtered.length ? c + OPTIONS_PAGE_SIZE : c));
    }
  };

  const select = (opt: string) => {
    onChange(opt);
    setOpen(false);
  };

  const visibleOptions = filtered.slice(0, visibleCount);

  const trigger = (
    <PlainButton
      type="button"
      onClick={isMobile ? () => setOpen(true) : undefined}
      data-testid={testId}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-foreground/15 px-3 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/[0.03] md:py-1.5",
        fullWidth ? "w-full justify-between" : "shrink-0",
        isActive && "border-primary/40 bg-primary/5 text-primary"
      )}
    >
      <span className="truncate">{selectedOption ? selectedOption.label : label}</span>
      <span className="flex items-center gap-1.5">
        {isActive && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            1
          </span>
        )}
        <ChevronDown size={14} className="text-foreground/40" />
      </span>
    </PlainButton>
  );

  const header = (
    <div className="p-3">
      <div className="flex items-center gap-2 rounded-lg border border-foreground/15 px-2.5 py-2.5 md:py-1.5">
        <Search size={13} className="shrink-0 text-foreground/40" />
        <input
          type="text"
          placeholder={`Cari ${label.toLowerCase()}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40 md:text-xs"
        />
        {search && (
          <PlainButton type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian">
            <X size={12} className="text-foreground/40 hover:text-foreground" />
          </PlainButton>
        )}
      </div>
    </div>
  );

  const list = (maxHeight: string) => (
    <div
      className={cn("overflow-y-auto border-t border-foreground/10", maxHeight)}
      onScroll={handleScroll}
    >
      {filtered.length === 0 ? (
        <p className="px-3 py-4 text-center text-xs text-foreground/40">Tidak ditemukan</p>
      ) : (
        visibleOptions.map((opt) => {
          const checked = opt.value === value;
          return (
            <PlainButton
              key={opt.value}
              type="button"
              onClick={() => select(opt.value)}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-foreground/[0.03] md:px-3 md:py-2.5"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border md:h-4 md:w-4",
                  checked ? "border-primary" : "border-foreground/30"
                )}
              >
                {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary md:h-2 md:w-2" />}
              </span>
              <span className="min-w-0 flex-1 text-[15px] break-words text-foreground md:text-sm">
                {opt.label}
              </span>
            </PlainButton>
          );
        })
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <DynamicModal open={open} onOpenChange={setOpen} title={label} dismissible>
          <div className="-mx-4 -mb-2">
            {header}
            {list("max-h-[55vh]")}
          </div>
        </DynamicModal>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-56 border-foreground/10 bg-popover p-0 shadow-2xl shadow-black/20"
        align="start"
      >
        {header}
        {list("max-h-48")}
      </PopoverContent>
    </Popover>
  );
}

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}

/**
 * Older multi-select that takes plain string options and is always a popover.
 * Prefer {@link MultiSelectOptionDropdown} in new code.
 */
export function MultiSelectDropdown({ label, options, value, onChange }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();
  const filtered = options.filter((o) => o.toLowerCase().includes(q));

  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  const clearAll = () => onChange([]);

  const activeCount = value.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PlainButton
          type="button"
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg border border-foreground/15 px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/[0.03]",
            activeCount > 0 && "border-primary/40 bg-primary/5 text-primary"
          )}
        >
          <span>{label}</span>
          {activeCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
          <ChevronDown size={14} className="text-foreground/40" />
        </PlainButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 border-foreground/10 bg-popover p-0 shadow-2xl shadow-black/20"
        align="start"
      >
        <div className="p-3">
          <p className="mb-2 text-sm font-bold text-foreground">{label}</p>
          <div className="flex items-center gap-2 rounded-lg border border-foreground/15 px-2.5 py-2.5 md:py-1.5">
            <Search size={13} className="shrink-0 text-foreground/40" />
            <input
              type="text"
              placeholder={`Cari ${label.toLowerCase()}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40 md:text-xs"
            />
            {search && (
              <PlainButton type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian">
                <X size={12} className="text-foreground/40 hover:text-foreground" />
              </PlainButton>
            )}
          </div>
          {activeCount > 0 && (
            <PlainButton
              type="button"
              onClick={clearAll}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Hapus semua
            </PlainButton>
          )}
        </div>
        <div className="max-h-48 overflow-y-auto border-t border-foreground/10">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-foreground/40">Tidak ditemukan</p>
          ) : (
            filtered.map((opt) => {
              const checked = value.includes(opt);
              return (
                <PlainButton
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-foreground/[0.03] md:px-3 md:py-2.5"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border md:h-4 md:w-4",
                      checked ? "border-primary bg-primary text-white" : "border-foreground/30"
                    )}
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] break-words text-foreground md:text-sm">
                    {opt}
                  </span>
                </PlainButton>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

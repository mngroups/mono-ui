"use client";

import { cn } from "@mono/utils";
import dayjs from "@mono/utils/dayjs";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { DynamicModal } from "../dynamic-modal/dynamic-modal.js";
import { Button } from "../ui/button.js";
import { Calendar } from "../ui/calendar.js";
import type { DateRange } from "../ui/date-range-picker.js";
import { PlainButton } from "../ui/plain-button.js";

/**
 * Trigger styled like {@link MultiSelectOptionDropdown}'s, so filters that are
 * not option lists still sit flush in the sheet's dropdown grid.
 */
function FilterTrigger({
  label,
  active,
  fullWidth,
  onClick,
}: {
  label: string;
  active?: boolean;
  fullWidth?: boolean;
  onClick: () => void;
}) {
  return (
    <PlainButton
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-foreground/15 px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/[0.03]",
        fullWidth ? "w-full justify-between" : "shrink-0",
        active && "border-primary/40 bg-primary/5 text-primary"
      )}
    >
      <span className="truncate">{label}</span>
      <span className="flex items-center gap-1.5">
        {active && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            1
          </span>
        )}
        <ChevronDown size={14} className="shrink-0 text-foreground/40" />
      </span>
    </PlainButton>
  );
}

/**
 * Date-range filter as a trigger plus its own bottom sheet — the calendar is
 * too tall to sit inline next to the other filters.
 */
export function DateRangeFilterControl({
  label = "Rentang tanggal",
  value,
  onChange,
  fullWidth = true,
}: {
  /** Trigger text while empty, and the sheet title. */
  label?: string;
  /** Selected range. */
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  /** Stretch the trigger to fill its container. Default: `true`. */
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const summary = value?.from
    ? value.to
      ? `${dayjs(value.from).format("DD MMM")} – ${dayjs(value.to).format("DD MMM YYYY")}`
      : dayjs(value.from).format("DD MMM YYYY")
    : label;

  return (
    <>
      <FilterTrigger
        label={summary}
        active={Boolean(value?.from)}
        fullWidth={fullWidth}
        onClick={() => setOpen(true)}
      />
      <DynamicModal open={open} onOpenChange={setOpen} title={label} dismissible>
        <Calendar mode="range" selected={value} onSelect={onChange} numberOfMonths={1} fullWidth />
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            Reset
          </Button>
          <Button className="flex-1" onClick={() => setOpen(false)}>
            Terapkan
          </Button>
        </div>
      </DynamicModal>
    </>
  );
}

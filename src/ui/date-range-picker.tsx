"use client";

import { cn } from "@mono/utils";
import dayjs from "@mono/utils/dayjs";
import { CalendarIcon, X } from "lucide-react";
import * as React from "react";
import type { DateRange, Matcher } from "react-day-picker";
import { Calendar } from "./calendar.js";
import { PlainButton } from "./plain-button.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

// Wed→Wed style week that contains `day`, anchored on `weekday` (0=Sun..6=Sat).
// `to` is the anchor of the following week (from + 7), matching the range the
// callers persist. Any day in the week resolves to the same range.
function weekRangeFor(day: Date, weekday: number): { from: Date; to: Date } {
  const d = dayjs(day).startOf("day");
  const diff = (d.day() - weekday + 7) % 7;
  const from = d.subtract(diff, "day");
  return { from: from.toDate(), to: from.add(7, "day").toDate() };
}

/**
 * Single-month range selection: the first click anchors the month, days outside
 * it are disabled until the second click completes the range.
 */
function useMonthRangeSelection(onChange: (range: DateRange) => void, onComplete?: () => void) {
  const [anchor, setAnchor] = React.useState<Date | null>(null);

  const outsideMonth: Matcher[] | undefined = anchor
    ? [
        { before: dayjs(anchor).startOf("month").toDate() },
        { after: dayjs(anchor).endOf("month").toDate() },
      ]
    : undefined;

  const select = (day: Date | undefined) => {
    if (!day) return;
    if (!anchor) {
      setAnchor(day);
      return;
    }
    const [from, to] = dayjs(day).isBefore(anchor) ? [day, anchor] : [anchor, day];
    setAnchor(null);
    onChange({ from, to });
    onComplete?.();
  };

  const pending: DateRange | undefined = anchor ? { from: anchor, to: undefined } : undefined;

  // Every day outside the anchor's month is disabled, so a view moved to
  // another month (arrows or the "Hari ini" jump) would be entirely unclickable
  // with the stale anchor still highlighted. Leaving the month drops the anchor.
  const onMonthChange = (month: Date) => {
    if (anchor && !dayjs(month).isSame(anchor, "month")) setAnchor(null);
  };

  return { outsideMonth, pending, select, onMonthChange, reset: () => setAnchor(null) };
}

const toMatchers = (...items: (Matcher | Matcher[] | undefined)[]) =>
  items.flatMap((m) => (m === undefined ? [] : Array.isArray(m) ? m : [m]));

const PREVIEW_CLASS_NAMES = {
  preview_start: "bg-primary/10 rounded-l-full",
  preview_middle: "bg-primary/10",
  preview_end: "bg-primary/10 rounded-r-full",
} as const;

interface DateRangePickerProps {
  /** Selected range (`{ from, to }`). */
  value?: DateRange;
  /** Called with the new range, or `undefined` when cleared. */
  onChange: (range: DateRange | undefined) => void;
  /** Trigger text while no range is picked. */
  placeholder?: string;
  className?: string;
  /** Show an × on the trigger that clears the range. Default `true`. */
  clearable?: boolean;
  /**
   * Lock the range length: the clicked date becomes `from` and `to` is snapped
   * to `from + fixedRangeDays`. The popover closes immediately after selection.
   */
  fixedRangeDays?: number;
  /**
   * Weekly-select mode: clicking any day selects the whole week (anchor →
   * anchor+7) that contains it, with a full-week highlight on hover. The value
   * = the anchor day (0=Sun..6=Sat, e.g. 3 for Wednesday). Replaces the range
   * calendar pattern where non-anchor days are disabled. The popover closes after selection.
   */
  snapToWeekday?: number;
  /** Show one month and keep the range inside it (from and to in the same month). */
  withinMonth?: boolean;
  /** Popover alignment relative to the trigger. Default "start". */
  align?: "start" | "center" | "end";
  /** Days that can't be picked (react-day-picker matchers), e.g. `{ after: today }`. */
  disabled?: Matcher | Matcher[];
  /** Month shown first when the popover opens. */
  defaultMonth?: Date;
  /** The trigger button's `data-testid`. */
  testId?: string;
}

/**
 * Date-range picker: a compact trigger that opens a two-month `Calendar` popover.
 * Modes: free range (default), fixed length (`fixedRangeDays`), whole weeks (`snapToWeekday`)
 * or a range inside one month (`withinMonth`).
 */
function DateRangePicker({
  value,
  onChange,
  placeholder = "Pilih rentang tanggal",
  className,
  clearable = true,
  fixedRangeDays,
  snapToWeekday,
  withinMonth = false,
  align = "start",
  disabled,
  defaultMonth,
  testId,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hoveredDay, setHoveredDay] = React.useState<Date | null>(null);
  const hasRange = !!value?.from;
  const monthSelection = useMonthRangeSelection(onChange, () => setOpen(false));

  const isWeekMode = snapToWeekday != null;
  const previewWeek = isWeekMode && hoveredDay ? weekRangeFor(hoveredDay, snapToWeekday) : null;
  const previewModifiers: Record<string, Matcher> | undefined = previewWeek
    ? {
        preview_start: previewWeek.from,
        preview_end: previewWeek.to,
        preview_middle: {
          from: dayjs(previewWeek.from).add(1, "day").toDate(),
          to: dayjs(previewWeek.to).subtract(1, "day").toDate(),
        },
      }
    : undefined;

  const label = hasRange
    ? value!.to
      ? `${dayjs(value!.from!).format("DD MMM")} – ${dayjs(value!.to).format("DD MMM YYYY")}`
      : dayjs(value!.from!).format("DD MMM YYYY")
    : placeholder;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) monthSelection.reset();
      }}
    >
      <PopoverTrigger asChild>
        <PlainButton
          type="button"
          data-testid={testId}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
            "flex w-full shrink-0 items-center justify-between gap-2 rounded-lg border border-foreground/15 px-3 py-1.5 text-sm text-foreground/70 hover:bg-foreground/[0.03] md:w-auto",
            className
          )}
        >
          <CalendarIcon size={14} className="shrink-0" />
          <span>{label}</span>
          {hasRange && clearable && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="ml-0.5 rounded-full hover:text-foreground"
            >
              <X size={12} />
            </span>
          )}
        </PlainButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-foreground/10 bg-popover p-0 shadow-2xl shadow-black/20 dark:shadow-black/60"
        align={align}
      >
        <Calendar
          mode="range"
          selected={(withinMonth && monthSelection.pending) || value}
          disabled={withinMonth ? toMatchers(disabled, monthSelection.outsideMonth) : disabled}
          defaultMonth={defaultMonth}
          onMonthChange={withinMonth ? monthSelection.onMonthChange : undefined}
          todayLabel={isWeekMode ? "Minggu ini" : undefined}
          onTodayClick={
            isWeekMode
              ? (day) => {
                  onChange(weekRangeFor(day, snapToWeekday));
                  setOpen(false);
                }
              : undefined
          }
          modifiers={previewModifiers}
          modifiersClassNames={PREVIEW_CLASS_NAMES}
          onDayMouseEnter={isWeekMode ? (day) => setHoveredDay(day) : undefined}
          onDayMouseLeave={isWeekMode ? () => setHoveredDay(null) : undefined}
          onSelect={(range, day) => {
            if (withinMonth) {
              monthSelection.select(day);
              return;
            }
            if (isWeekMode) {
              if (!day) return;
              onChange(weekRangeFor(day, snapToWeekday));
              setOpen(false);
              return;
            }
            if (fixedRangeDays == null) {
              onChange(range);
              return;
            }
            if (!day) return;
            onChange({ from: day, to: dayjs(day).add(fixedRangeDays, "day").toDate() });
            setOpen(false);
          }}
          numberOfMonths={withinMonth ? 1 : 2}
        />
      </PopoverContent>
    </Popover>
  );
}

export type { DateRange };
export { DateRangePicker, toMatchers, useMonthRangeSelection };

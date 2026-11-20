"use client";

import { useWitaTodayDate } from "@mono/hooks";
import { cn } from "@mono/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker, dateMatchModifiers } from "react-day-picker";
import { PlainButton } from "./plain-button.js";

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Stretch the grid to fill its container instead of the default fixed-width
   * columns — for the mobile bottom sheets, where a calendar pinned to 36px
   * columns leaves dead space on either side of a full-width drawer.
   */
  fullWidth?: boolean;
  /** Footer button ("Hari ini", or "Bulan ini" when today is disabled) that jumps the view back to the current month. */
  showTodayButton?: boolean;
  /** Overrides the button's label, e.g. "Minggu ini" for weekly pickers. */
  todayLabel?: string;
  /**
   * Also select on click, not just move the view. Receives today, or the
   * latest enabled day before it when today is disabled.
   */
  onTodayClick?: (target: Date) => void;
};

/** `today`, or the latest day before it that `disabled` allows (up to a year back). */
function latestEnabledDay(today: Date, disabled: CalendarProps["disabled"]): Date {
  const day = new Date(today);
  if (disabled === undefined) return day;
  for (let i = 0; i < 366 && dateMatchModifiers(day, disabled); i++) {
    day.setDate(day.getDate() - 1);
  }
  return day;
}

/**
 * Month grid for picking a single day, several days or a range (react-day-picker v9, MoNo styling).
 * "Today" is the WITA calendar day, and a footer button jumps back to the current month.
 * All `DayPicker` props pass through (`mode`, `selected`, `onSelect`, `disabled`, `numberOfMonths`, …).
 * Usually wrapped by `DatePickerBase` or `DateRangePicker` rather than used on its own.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fullWidth = false,
  showTodayButton = true,
  todayLabel,
  onTodayClick,
  month: monthProp,
  onMonthChange,
  ...props
}: CalendarProps) {
  // "Today" is the WITA calendar day, not the browser's, so the highlight and the
  // footer button agree with the WITA-based H-1 caps the pickers pass in.
  const witaToday = useWitaTodayDate();
  const today = props.today ?? witaToday;
  // Own the visible month (unless the caller controls it) so the footer button
  // can move it; DayPicker's internal month isn't reachable from outside.
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => props.defaultMonth ?? today);
  const month = monthProp ?? internalMonth;
  const changeMonth = (next: Date) => {
    if (monthProp === undefined) setInternalMonth(next);
    onMonthChange?.(next);
  };

  // With several months on screen, land today in the last one: these pickers
  // mostly look back (future days are disabled), so the earlier month is the
  // useful context.
  const jumpToToday = () => {
    changeMonth(
      new Date(today.getFullYear(), today.getMonth() - ((props.numberOfMonths ?? 1) - 1), 1)
    );
    onTodayClick?.(latestEnabledDay(today, props.disabled));
  };

  // Pickers capped at H-1 can't select today, so "Hari ini" would promise a
  // day the user can't pick — the button only moves the view, so call it what
  // it is there.
  const todayDisabled = props.disabled !== undefined && dateMatchModifiers(today, props.disabled);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={month}
      onMonthChange={changeMonth}
      footer={
        props.footer ??
        (showTodayButton && (
          <PlainButton
            type="button"
            onClick={jumpToToday}
            className="rounded-md px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            {todayLabel ?? (todayDisabled ? "Bulan ini" : "Hari ini")}
          </PlainButton>
        ))
      }
      className={cn("p-3 select-none", fullWidth && "w-full", className)}
      classNames={{
        months: cn("relative flex flex-col gap-4 sm:flex-row", fullWidth && "w-full"),
        month: cn("space-y-3", fullWidth && "w-full"),
        month_caption: "relative flex h-9 items-center justify-center",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between",
        button_previous: cn(
          "flex h-7 w-7 items-center justify-center rounded-md",
          "text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground",
          "disabled:pointer-events-none disabled:opacity-30"
        ),
        button_next: cn(
          "flex h-7 w-7 items-center justify-center rounded-md",
          "text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground",
          "disabled:pointer-events-none disabled:opacity-30"
        ),
        month_grid: "w-full border-collapse",
        weekdays: cn("flex", fullWidth && "w-full"),
        weekday: cn(
          "flex h-8 items-center justify-center text-xs font-normal text-muted-foreground",
          fullWidth ? "flex-1" : "w-9"
        ),
        weeks: "",
        week: cn("mt-1 flex", fullWidth && "w-full"),
        // Full-width cells are taller than the day circle; the vertical padding
        // plus content-box clip keeps the range band exactly the circle's height.
        day: cn(
          "flex items-center justify-center p-0",
          fullWidth ? "h-11 flex-1 bg-clip-content py-0.5" : "h-9 w-9"
        ),
        day_button: cn(
          "rounded-full text-sm text-foreground/80 transition-colors",
          "hover:bg-foreground/10 hover:text-foreground focus:outline-none",
          fullWidth ? "h-10 w-10 text-base" : "h-9 w-9"
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90 [&>button]:hover:text-primary-foreground",
        today: "[&>button]:ring-1 [&>button]:ring-foreground/30 [&>button]:font-semibold",
        outside: "[&>button]:text-foreground/30 [&>button]:pointer-events-none",
        disabled:
          "[&>button]:opacity-25 [&>button]:pointer-events-none [&>button]:cursor-not-allowed",
        // Cells can be much wider than the circle, so the band on the end days
        // only covers the half facing the range — the circle closes the other
        // side. No band at all for a one-day range or where the row ends.
        range_start: cn(
          "rdp-range-start bg-linear-to-r from-transparent from-50% to-primary/15 to-50%",
          "last:bg-none [&.rdp-range-end]:bg-none",
          "[&>button]:bg-primary [&>button]:text-primary-foreground"
        ),
        range_end: cn(
          "rdp-range-end bg-linear-to-l from-transparent from-50% to-primary/15 to-50%",
          "first:bg-none [&.rdp-range-start]:bg-none",
          "[&>button]:bg-primary [&>button]:text-primary-foreground"
        ),
        // `selected` also lands on middle days; `!` beats its white-on-primary.
        range_middle: cn(
          "bg-primary/15 first:rounded-l-full last:rounded-r-full",
          "[&>button]:rounded-none [&>button]:bg-transparent! [&>button]:text-foreground!"
        ),
        hidden: "invisible",
        footer: "border-foreground/10 mt-3 flex justify-start border-t pt-2",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />,
      }}
      {...props}
      today={today}
    />
  );
}

export { Calendar };

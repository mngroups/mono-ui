"use client";

import { useIsMobile } from "@mono/hooks";
import { cn, witaNow } from "@mono/utils";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DynamicModal } from "../dynamic-modal/dynamic-modal.js";
import { PlainButton } from "./plain-button.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

const PAGE_SIZE = 12;

interface YearPickerProps {
  /** The selected year. */
  year: number;
  /** Years before this are shown disabled. */
  minYear?: number;
  /** Years after this are shown disabled. Defaults to the current WITA year. */
  maxYear?: number;
  /** Called with the picked year; the picker then closes. */
  onSelectYear: (year: number) => void;
  /** Popover alignment against the trigger (desktop only). */
  align?: "start" | "center" | "end";
  /** Gap between trigger and popover (desktop only), e.g. to clear a header card. */
  sideOffset?: number;
  /** Title of the mobile bottom sheet. */
  title?: string;
}

const pageStartOf = (year: number) => year - (year % PAGE_SIZE);

/**
 * Year selector: a pill trigger that opens a 12-year grid — a popover on
 * desktop, a bottom sheet on mobile. Years outside [minYear, maxYear] are
 * disabled, and paging stops once a page holds no selectable year.
 */
export function YearPicker({
  year,
  minYear = -Infinity,
  maxYear = witaNow().year(),
  onSelectYear,
  align = "end",
  sideOffset,
  title = "Pilih tahun",
}: YearPickerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [pageStart, setPageStart] = useState(() => pageStartOf(year));

  const handleOpenChange = (next: boolean) => {
    if (next) setPageStart(pageStartOf(year));
    setOpen(next);
  };

  const pageEnd = pageStart + PAGE_SIZE - 1;
  const years = Array.from({ length: PAGE_SIZE }, (_, i) => pageStart + i);

  const grid = (
    <div className={cn("flex flex-col gap-3 p-3", !isMobile && "w-72")}>
      <div className="flex items-center justify-between">
        <PlainButton
          type="button"
          aria-label="Tahun sebelumnya"
          onClick={() => setPageStart((s) => s - PAGE_SIZE)}
          disabled={pageStart <= minYear}
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-foreground/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </PlainButton>
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {pageStart} – {pageEnd}
        </span>
        <PlainButton
          type="button"
          aria-label="Tahun berikutnya"
          onClick={() => setPageStart((s) => s + PAGE_SIZE)}
          disabled={pageEnd >= maxYear}
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-foreground/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </PlainButton>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map((y) => {
          const disabled = y < minYear || y > maxYear;
          const selected = y === year;
          return (
            <PlainButton
              key={y}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => {
                onSelectYear(y);
                setOpen(false);
              }}
              className={cn(
                "h-10 rounded-full text-sm tabular-nums transition-colors",
                selected
                  ? "bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                  : "text-foreground hover:bg-foreground/5",
                "disabled:pointer-events-none disabled:text-foreground/30"
              )}
            >
              {y}
            </PlainButton>
          );
        })}
      </div>
    </div>
  );

  const pill = (
    <PlainButton
      type="button"
      onClick={isMobile ? () => handleOpenChange(true) : undefined}
      className="flex w-full shrink-0 items-center justify-between gap-2 rounded-lg border border-foreground/15 px-3 py-1.5 text-sm text-foreground/70 hover:bg-foreground/[0.03] md:w-auto"
    >
      <div className="flex items-center gap-2">
        <CalendarDays size={15} />
        <span className="tabular-nums">{year}</span>
      </div>
      <ChevronDown size={14} className="text-foreground/40" />
    </PlainButton>
  );

  if (isMobile) {
    return (
      <>
        {pill}
        <DynamicModal open={open} onOpenChange={handleOpenChange} title={title} dismissible>
          {grid}
        </DynamicModal>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{pill}</PopoverTrigger>
      <PopoverContent
        className="w-auto border-foreground/10 bg-popover p-0 shadow-2xl shadow-black/20"
        align={align}
        sideOffset={sideOffset}
      >
        {grid}
      </PopoverContent>
    </Popover>
  );
}

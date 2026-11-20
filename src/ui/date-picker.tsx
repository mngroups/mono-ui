"use client";

import { useIsMobile } from "@mono/hooks";
import { cn, witaDateString, witaDateToLocalDate } from "@mono/utils";
import dayjs from "@mono/utils/dayjs";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { type Control, Controller, type FieldValues, type Path } from "react-hook-form";
import { DynamicModal } from "../dynamic-modal/dynamic-modal.js";
import { Calendar } from "./calendar.js";
import { PlainButton } from "./plain-button.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

interface DatePickerBaseProps {
  /** Selected date as `YYYY-MM-DD`; empty or invalid shows the placeholder. */
  value?: string;
  /** Called with the picked date as `YYYY-MM-DD`. */
  onChange: (val: string) => void;
  /** Small label above the trigger; also the mobile sheet's title. */
  label?: string;
  /** Trigger text while no date is picked. */
  placeholder?: string;
  /** Disable the trigger. */
  disabled?: boolean;
  /** Disable days before today (WITA). */
  disablePast?: boolean;
  /** Error state: red border, like the floating inputs. */
  invalid?: boolean;
  className?: string;
  /** The trigger button's `data-testid`. */
  testId?: string;
}

/**
 * Single-date picker with a controlled `YYYY-MM-DD` string value. Opens a `Calendar` in a popover
 * on desktop and in a `DynamicModal` bottom sheet on mobile. For react-hook-form, use `FormDatePicker`.
 */
function DatePickerBase({
  value,
  onChange,
  label,
  placeholder = "Pilih tanggal",
  disabled,
  disablePast,
  invalid,
  className,
  testId,
}: DatePickerBaseProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const parsed = value ? dayjs(value) : undefined;
  const selectedDate = parsed?.isValid() ? parsed.toDate() : undefined;
  const disabledMatcher = disablePast
    ? { before: witaDateToLocalDate(witaDateString()) }
    : undefined;

  const triggerButton = (
    <PlainButton
      type="button"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onClick={isMobile ? () => setOpen(true) : undefined}
      data-testid={testId}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
        "text-foreground focus:outline-none",
        invalid ? "border-destructive" : open ? "border-primary" : "border-foreground/20",
        "disabled:cursor-not-allowed disabled:opacity-50"
      )}
    >
      {selectedDate ? (
        <span>{dayjs(selectedDate).format("DD MMM YYYY")}</span>
      ) : (
        <span className="text-foreground/30">{placeholder}</span>
      )}
      <CalendarIcon size={14} className="shrink-0 text-foreground/40" />
    </PlainButton>
  );

  const calendar = (
    <Calendar
      mode="single"
      selected={selectedDate}
      defaultMonth={selectedDate}
      onSelect={(date) => {
        onChange(date ? dayjs(date).format("YYYY-MM-DD") : "");
        setOpen(false);
      }}
      disabled={disabledMatcher}
    />
  );

  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-xs text-muted-foreground">{label}</label>}

      {isMobile ? (
        <>
          {triggerButton}
          <DynamicModal open={open} onOpenChange={setOpen} title={label || placeholder} dismissible>
            <div className="flex justify-center">{calendar}</div>
          </DynamicModal>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            className="w-auto border-foreground/10 bg-popover p-0 shadow-2xl shadow-black/20 dark:shadow-black/60"
            align="start"
          >
            {calendar}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

interface FormDatePickerProps<T extends FieldValues> {
  /** The `control` from `useForm()`. */
  control: Control<T>;
  /** Field name; the field holds a `YYYY-MM-DD` string. */
  name: Path<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  disablePast?: boolean;
  className?: string;
  testId?: string;
}

/**
 * `DatePickerBase` bound to a react-hook-form field: shows the error state and the
 * validation message under the trigger.
 */
function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  disablePast,
  className,
  testId,
}: FormDatePickerProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <DatePickerBase
            value={field.value as string}
            onChange={field.onChange}
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            disablePast={disablePast}
            invalid={!!fieldState.error}
            testId={testId}
          />
          {/* Without it a rejected date only shows as a disabled submit button. */}
          {fieldState.error?.message && (
            <p className="mt-1 text-xs text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}

export { DatePickerBase, FormDatePicker };

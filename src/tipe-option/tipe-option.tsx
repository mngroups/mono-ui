"use client";

import { cn } from "@mono/utils";
import { type ReactNode, useId } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group.js";

export interface TipeOptionItem<T extends string = string> {
  /** Value passed to `onChange` when the card is picked. */
  value: T;
  /** Card heading. */
  label: ReactNode;
  /** Optional muted line under the label. */
  desc?: ReactNode;
  /** Greys the card out and makes it unselectable. */
  disabled?: boolean;
  /** Small uppercase pill next to the label, e.g. "Segera". */
  badge?: ReactNode;
  /** `data-testid` on the card. */
  testId?: string;
}

/**
 * Card-style radio group on top of the shadcn RadioGroup (Radix): Radix owns
 * the radio dot, roles and arrow-key navigation; each option renders as a
 * bordered card with a label, description and optional badge.
 */
export function TipeOptionGroup<T extends string = string>({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  /** The cards, in display order. */
  options: readonly TipeOptionItem<T>[];
  /** Selected value; `null` selects nothing. Controlled only. */
  value: T | null;
  /** Called with the picked option's value. */
  onChange: (value: T) => void;
  /** Accessible name of the group (required: there is no visible group label). */
  "aria-label": string;
  /** Classes for the group, e.g. a grid layout. */
  className?: string;
}) {
  const baseId = useId();
  return (
    <RadioGroup
      aria-label={ariaLabel}
      // Radix treats "" as "nothing selected"; `undefined` would make it uncontrolled.
      value={value ?? ""}
      onValueChange={(v) => onChange(v as T)}
      className={className}
    >
      {options.map((opt) => {
        const isSelected = !opt.disabled && opt.value === value;
        const id = `${baseId}-${opt.value}`;
        return (
          <label
            key={opt.value}
            htmlFor={id}
            data-testid={opt.testId}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-3.5 transition-colors",
              opt.disabled
                ? "cursor-not-allowed border-foreground/10 bg-foreground/5"
                : isSelected
                  ? "cursor-pointer border-primary bg-primary/10"
                  : "cursor-pointer border-foreground/10 bg-card hover:border-primary"
            )}
          >
            <RadioGroupItem id={id} value={opt.value} disabled={opt.disabled} className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                {opt.badge && (
                  <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] tracking-wide text-foreground/50 uppercase">
                    {opt.badge}
                  </span>
                )}
              </div>
              {opt.desc ? <p className="mt-0.5 text-xs text-foreground/40">{opt.desc}</p> : null}
            </div>
          </label>
        );
      })}
    </RadioGroup>
  );
}

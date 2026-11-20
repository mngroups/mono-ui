"use client";

import { cn } from "@mono/utils";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "../ui/form.js";
import { Input } from "../ui/input.js";

type BaseInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "name" | "defaultValue" | "prefix" | "suffix"
>;

interface FloatingInputProps<T extends FieldValues> extends BaseInputProps {
  /** `control` from the surrounding `useForm()`. */
  control: Control<T>;
  /** Field path in the form values; also used as the input `id`. */
  name: Path<T>;
  /** Text that sits inside the field and floats into the border on focus or value. */
  label: string;
  /** Node shown inside the field on the left, e.g. an icon. */
  prefix?: React.ReactNode;
  /** Node shown inside the field on the right, e.g. a unit such as "L" or "ton". */
  suffix?: React.ReactNode;
  /** Use a plain placeholder instead of the floating label. */
  disableFloating?: boolean;
  /**
   * Fires when the browser autofill state of the input flips. Chrome hides an
   * autofilled value from JS until the first user gesture, so react-hook-form
   * still sees "" — forms use this to avoid disabling submit on a filled field.
   */
  onAutofillChange?: (autofilled: boolean) => void;
}

// The float state is driven purely by CSS, never by React state. Browsers hide
// the autofill *preview* value from JS — while the user hovers a saved
// suggestion, `input.value` still reads "" — so any JS-based check leaves the
// label sitting on top of the previewed text. `:placeholder-shown` reflects
// what's actually rendered, so it flips during the preview and the label
// follows. This relies on the input carrying `placeholder=" "` (a single
// space), set below.
//
// Deliberately `peer-*` (sibling combinator) and not `:has()` on a wrapper:
// Chromium's style invalidation for `:has()` is unreliable for autofill-driven
// changes — the first hover over a suggestion often failed to restyle, while
// hovering a second one worked. Sibling invalidation doesn't have that
// problem. This is why the input is rendered *first*: `~` only looks forward,
// so everything reacting to it must follow it. The legend is reached through
// the fieldset with `[&>legend]` since it isn't itself a sibling.
//
// The focus and has-content variants both set the same floated values rather
// than one overriding the other — they have equal specificity, so which won
// would depend on Tailwind's generated source order, not on class order here.
// Written out in full: Tailwind scans for literal class strings, so these
// can't be composed from template literals or they'd never be generated.
//
// The autofill variants cover Chrome filling saved credentials on page load:
// the value is hidden from JS and `:placeholder-shown` keeps matching, but
// `:autofill` / `:-webkit-autofill` match from the first style pass — before
// React hydrates — so the label floats immediately. They're separate variants
// (not one selector list) because a browser that doesn't know one of the
// pseudo-classes would drop the whole rule.
export const FLOATED_LEGEND =
  "peer-focus:[&>legend]:max-w-full peer-focus:[&>legend]:px-2 peer-[:not(:placeholder-shown)]:[&>legend]:max-w-full peer-[:not(:placeholder-shown)]:[&>legend]:px-2 peer-[:autofill]:[&>legend]:max-w-full peer-[:autofill]:[&>legend]:px-2 peer-[:-webkit-autofill]:[&>legend]:max-w-full peer-[:-webkit-autofill]:[&>legend]:px-2";

export const FLOATED_LABEL =
  "peer-focus:top-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:autofill]:top-0 peer-[:autofill]:text-xs peer-[:-webkit-autofill]:top-0 peer-[:-webkit-autofill]:text-xs";

const AUTOFILL_POLL_INTERVAL_MS = 100;
const AUTOFILL_POLL_DURATION_MS = 3000;

function isAutofilledNow(input: HTMLInputElement): boolean {
  for (const selector of [":autofill", ":-webkit-autofill"]) {
    try {
      if (input.matches(selector)) return true;
    } catch {
      // Selector unsupported by this browser — try the next one.
    }
  }
  return false;
}

/**
 * Text input with a floating label in a notched outline, wired to a
 * react-hook-form field. Shows the field's validation message below it.
 * Must be rendered inside `Form` (react-hook-form's `FormProvider`).
 */
export function FloatingInput<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  prefix,
  suffix,
  disableFloating = false,
  onAutofillChange,
  className,
  ...inputProps
}: FloatingInputProps<T>) {
  const inputId = String(name);

  // Covers the gap the CSS above can't: an autofill preview on a field that
  // doesn't have focus. See the keyframes in globals.css for why this needs a
  // JS round-trip. Note we only track *whether* the field is autofilled — the
  // previewed value itself is deliberately hidden from JS (input.value stays
  // ""), so reading it is not an option.
  const [isAutofilled, setIsAutofilled] = useState(false);

  const handleAnimationStart = (event: React.AnimationEvent<HTMLInputElement>) => {
    if (event.animationName === "floating-input-autofill-start") setIsAutofilled(true);
    else if (event.animationName === "floating-input-autofill-end") setIsAutofilled(false);
    inputProps.onAnimationStart?.(event);
  };

  // Chrome autofills saved credentials on page load *before* React hydrates,
  // so the autofill-start animation fires while no listener is attached yet.
  // Poll the autofill state for a short window after mount (Chrome can fill
  // well after first paint on a slow dev hydration). Only ever sets true —
  // clearing is still handled by the autofill-end animation.
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const startedAt = Date.now();
    const check = () => {
      const input = wrapperRef.current?.querySelector("input");
      if (input && isAutofilledNow(input)) {
        setIsAutofilled(true);
        return true;
      }
      return false;
    };
    if (check()) return;
    const interval = window.setInterval(() => {
      if (check() || Date.now() - startedAt > AUTOFILL_POLL_DURATION_MS) {
        window.clearInterval(interval);
      }
    }, AUTOFILL_POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  // Latest-callback ref so an inline arrow from the parent doesn't re-fire
  // the effect below on every render.
  const onAutofillChangeRef = useRef(onAutofillChange);
  useEffect(() => {
    onAutofillChangeRef.current = onAutofillChange;
  });
  useEffect(() => {
    onAutofillChangeRef.current?.(isAutofilled);
  }, [isAutofilled]);

  const shouldFloat = !disableFloating && isAutofilled;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;

        return (
          <FormItem className="space-y-1">
            <div ref={wrapperRef} className="relative flex h-12">
              <Input
                {...field}
                {...inputProps}
                id={inputId}
                type={type}
                style={{ height: "100%" }}
                placeholder={disableFloating ? label : " "}
                onAnimationStart={handleAnimationStart}
                className={cn(
                  "autofill-watch peer w-full rounded-xl border-none bg-transparent text-sm shadow-none",
                  "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  prefix ? "pl-10" : "pl-4",
                  suffix ? "pr-10" : "pr-4",
                  className
                )}
              />

              {/* Notch border — fieldset owns the border, legend cuts it at the label */}
              <fieldset
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 m-0 min-w-0 rounded-xl border p-0",
                  FLOATED_LEGEND,
                  shouldFloat && "[&>legend]:max-w-full [&>legend]:px-2",
                  hasError ? "border-destructive" : "border-border peer-focus:border-primary"
                )}
              >
                {!disableFloating && (
                  <legend
                    className={cn(
                      "invisible inline-block h-px overflow-hidden text-xs leading-none whitespace-nowrap select-none",
                      "transition-[max-width] duration-200 ease-out",
                      "max-w-[0.01px]",
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

              {!disableFloating && (
                <label
                  htmlFor={inputId}
                  className={cn(
                    "pointer-events-auto absolute z-10 cursor-text px-1 leading-none select-none",
                    "transition-all duration-200 ease-out",
                    prefix ? "left-10" : "left-3",
                    "top-1/2 -translate-y-1/2 text-sm",
                    FLOATED_LABEL,
                    shouldFloat && "top-0 text-xs",
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

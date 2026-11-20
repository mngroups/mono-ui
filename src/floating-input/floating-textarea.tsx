"use client";

import { cn } from "@mono/utils";
import type * as React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "../ui/form.js";
import { Textarea } from "../ui/textarea.js";
import { FLOATED_LABEL, FLOATED_LEGEND } from "./floating-input.js";

interface FloatingTextareaProps<T extends FieldValues>
  extends Omit<React.ComponentProps<typeof Textarea>, "name" | "defaultValue"> {
  /** `control` from the surrounding `useForm()`. */
  control: Control<T>;
  /** Field path in the form values; also used as the textarea `id`. */
  name: Path<T>;
  /** Text that floats into the border on focus or value. */
  label: string;
  /**
   * Shows a `n/max` counter that turns red past the limit. Not the native `maxLength`, which would
   * silently cut a paste: the schema's `.max()` rejects the overflow with a visible error instead.
   */
  maxChars?: number;
}

/** Multi-line twin of `FloatingInput`: same notched border and CSS-driven floating label. */
export function FloatingTextarea<T extends FieldValues>({
  control,
  name,
  label,
  className,
  maxChars,
  ...textareaProps
}: FloatingTextareaProps<T>) {
  const id = String(name);
  const textareaTestId = (textareaProps as { "data-testid"?: string })["data-testid"];

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const length = String(field.value ?? "").length;
        return (
          <FormItem className="space-y-1">
            <div className="relative">
              <Textarea
                {...field}
                {...textareaProps}
                id={id}
                placeholder=" "
                className={cn(
                  "peer min-h-24 w-full rounded-xl border-none bg-transparent px-4 py-3 text-sm shadow-none dark:bg-transparent",
                  "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  className
                )}
              />
              <fieldset
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 m-0 min-w-0 rounded-xl border p-0",
                  FLOATED_LEGEND,
                  hasError ? "border-destructive" : "border-border peer-focus:border-primary"
                )}
              >
                <legend className="invisible ml-2 inline-block h-px max-w-[0.01px] overflow-hidden text-xs leading-none whitespace-nowrap transition-[max-width] duration-200 ease-out select-none">
                  {label}
                </legend>
              </fieldset>
              <label
                htmlFor={id}
                className={cn(
                  "absolute top-[22px] left-3 z-10 -translate-y-1/2 cursor-text px-1 text-sm leading-none select-none",
                  "transition-all duration-200 ease-out",
                  FLOATED_LABEL,
                  hasError ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {label}
              </label>
            </div>
            {maxChars === undefined ? (
              <FormMessage className="text-xs" />
            ) : (
              <div className="flex items-start gap-2">
                <FormMessage className="flex-1 text-xs" />
                <p
                  aria-live="polite"
                  className={cn(
                    "ml-auto shrink-0 text-xs",
                    length > maxChars ? "text-destructive" : "text-muted-foreground"
                  )}
                  data-testid={textareaTestId && `${textareaTestId}-counter`}
                >
                  {length}/{maxChars}
                </p>
              </div>
            )}
          </FormItem>
        );
      }}
    />
  );
}

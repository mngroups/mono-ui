import { cn } from "@mono/utils";
import type * as React from "react";

/**
 * Single-line text field with all native `<input>` props, styled like the `Floating*` fields
 * (48px, `rounded-xl`, primary border on focus). Use `size="sm"` (36px) in dense places such as
 * toolbars. Set `aria-invalid` to show the error style; inside `FormControl` that happens
 * automatically.
 */
function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & {
  /** Field height: `default` (48px, matches the `Floating*` fields) or `sm` (36px). */
  size?: "default" | "sm";
}) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        "w-full min-w-0 border border-border bg-transparent text-sm transition-colors outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-9 rounded-lg px-3" : "h-12 rounded-xl px-4",
        "focus-visible:border-primary",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };

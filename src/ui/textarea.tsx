import { cn } from "@mono/utils";
import type * as React from "react";

/**
 * Multi-line text field with all native `<textarea>` props, styled like `FloatingTextarea`. It grows with its content
 * (`field-sizing: content`); set `rows` or a height class to change the starting size.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

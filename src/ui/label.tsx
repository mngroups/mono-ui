"use client";

import { cn } from "@mono/utils";
import * as LabelPrimitive from "@radix-ui/react-label";
import type * as React from "react";

/**
 * Accessible label (Radix) for a form control: link it with `htmlFor`. It dims when a `peer`
 * control before it is disabled. Inside a `Form`, use `FormLabel` instead.
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };

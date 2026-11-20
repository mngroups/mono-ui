import { cn } from "@mono/utils";
import { forwardRef, type HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** `circular` keeps the placeholder round; the others are square-cornered. */
  variant?: "text" | "rectangular" | "circular";
}

/**
 * shadcn-style Skeleton with a shimmer and theme-aware colours
 * (`--skeleton-base`/`--skeleton-highlight`, mixed from `--foreground` so it
 * follows dark mode). It has no built-in size: size and shape come entirely
 * from `className`, so `<Skeleton className="h-4 w-20" />` renders exactly that.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, style, variant, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "animate-skeleton-shimmer",
        variant === "circular" ? "rounded-full" : "rounded-none",
        className
      )}
      style={{
        background:
          "linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-highlight) 50%, var(--skeleton-base) 75%)",
        backgroundSize: "200% 100%",
        ...style,
      }}
      {...props}
    />
  )
);

Skeleton.displayName = "Skeleton";

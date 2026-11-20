import { cva, type VariantProps } from "class-variance-authority";

// 24px-high text buttons, 8px gap, 14px regular text. Page buttons grow with
// their label, so 4–5 digit pages fit.

export const paginationVariants = cva("flex shrink-0 items-center gap-2 text-sm");

const BUTTON_BASE =
  "flex h-6 min-w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg px-2 whitespace-nowrap tabular-nums transition-colors";

export const paginationPageButtonVariants = cva(BUTTON_BASE, {
  variants: {
    active: {
      true: "bg-primary text-white hover:bg-primary",
      false: "text-foreground hover:bg-foreground/10",
    },
    disabled: {
      true: "pointer-events-none opacity-50",
    },
  },
  defaultVariants: { active: false, disabled: false },
});

export const paginationNavButtonVariants = cva(
  [
    BUTTON_BASE,
    "text-foreground hover:bg-foreground/10",
    "disabled:cursor-not-allowed disabled:text-foreground/30 disabled:hover:bg-transparent",
  ],
  {
    variants: {
      disabled: { true: "" },
    },
    defaultVariants: { disabled: false },
  }
);

export const paginationEllipsisVariants = cva(
  [BUTTON_BASE, "group text-foreground hover:bg-foreground/10"],
  {
    variants: {
      disabled: { true: "pointer-events-none opacity-50" },
    },
    defaultVariants: { disabled: false },
  }
);

export type PaginationVariantProps = VariantProps<typeof paginationVariants>;

import { cn } from "@mono/utils";

/** Theme for the mobile pager controls (see `.ops-pagination` in globals.css). */
export const PAGINATION_THEME = cn(
  "ops-pagination text-foreground",
  "[&_button]:!text-foreground",
  "[&_svg]:!text-foreground",
  "[&_button:hover]:!bg-foreground/10",
  "[&_button:disabled]:!text-foreground/30 [&_button:disabled:hover]:!bg-transparent",
  "[&_button]:!rounded-lg",
  "[&_[role='combobox']]:!rounded-lg",
  "[&_input]:!rounded-lg",
  "[&_[role='listbox']]:!rounded-xl [&_[role='listbox']]:!border-foreground/10 [&_[role='listbox']]:!bg-popover",
  "[&_[role='option']]:!rounded-md [&_[role='option']]:!bg-transparent [&_[role='option']]:!text-foreground/80",
  "[&_[role='option']:hover]:!bg-foreground/10 [&_[role='option']:hover]:!text-foreground"
);

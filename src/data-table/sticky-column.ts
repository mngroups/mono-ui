import { cn } from "@mono/utils";

/**
 * Casts leftwards so columns sliding under the frozen one look tucked beneath it.
 * A pseudo-element, not box-shadow: browsers drop shadows on table cells once
 * `border-collapse: collapse` is in play (Tailwind's preflight sets it).
 */
export const STICKY_SHADOW = cn(
  "before:pointer-events-none before:absolute before:inset-y-0 before:-left-1.5 before:w-1.5 before:content-['']",
  "before:bg-[linear-gradient(to_left,rgba(0,0,0,0.06),transparent)]",
  "dark:before:bg-[linear-gradient(to_left,rgba(0,0,0,0.28),transparent)]"
);

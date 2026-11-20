"use client";

import { cn } from "@mono/utils";
import { ChevronDown } from "lucide-react";
import { Children, memo, type ReactNode } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible.js";
import { PlainButton } from "../ui/plain-button.js";

/** One label/value line in a {@link MobileDataCard}. */
export type MobileDataRow = {
  label: string;
  value: ReactNode;
  /** Put the value under the label. Automatic for long text or multiple children. */
  stacked?: boolean;
};

/** A button in the card's action row. */
export type MobileDataAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  /** `danger` turns the button red on hover (delete, cancel). */
  variant?: "default" | "danger";
  testId?: string;
};

/** Back-compat aliases for the boundary-management naming. */
export type MobileEntryRow = MobileDataRow;
export type MobileEntryAction = MobileDataAction;

const DetailRow = memo(function DetailRow({ label, value, stacked }: MobileDataRow) {
  const textValue = typeof value === "string" ? value : undefined;
  const isStackedValue =
    stacked ||
    (textValue !== undefined && (textValue.length > 30 || textValue.includes("\n"))) ||
    Children.count(value) > 1;

  return (
    <div
      className={cn(
        "text-sm",
        isStackedValue ? "space-y-1" : "flex items-start justify-between gap-3"
      )}
    >
      <span className={cn("text-foreground/50", isStackedValue ? "block" : "shrink-0")}>
        {label}
      </span>
      <div
        className={cn(
          "min-w-0 break-words text-foreground",
          isStackedValue ? "w-full" : "flex flex-1 justify-end text-right"
        )}
      >
        {value}
      </div>
    </div>
  );
});

function ActionRow({ actions }: { actions: MobileDataAction[] }) {
  return (
    <div
      className={cn(
        "gap-2",
        // 3+ actions in one flex row squeeze long labels; wrap to a 2-column
        // grid instead so each button keeps its label on one line.
        actions.length > 2 ? "grid grid-cols-2" : "grid grid-cols-1"
      )}
    >
      {actions.map((a, i) => {
        // An odd action out on its own row stretches full width instead of
        // sitting half-empty next to a blank cell.
        const isLastAlone =
          actions.length > 2 && actions.length % 2 === 1 && i === actions.length - 1;
        return (
          <PlainButton
            key={i}
            type="button"
            onClick={a.onClick}
            disabled={a.disabled}
            title={a.title}
            data-testid={a.testId}
            className={cn(
              "flex h-10 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:text-foreground/20 disabled:hover:border-foreground/20 disabled:hover:text-foreground/20",
              actions.length > 2 ? "min-w-0" : "flex-1",
              isLastAlone && "col-span-2",
              a.variant === "danger"
                ? "border-foreground/20 text-foreground/70 hover:border-red-500/40 hover:text-red-400"
                : "border-foreground/20 text-foreground/70 hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {a.icon}
            <span className="truncate">{a.label}</span>
          </PlainButton>
        );
      })}
    </div>
  );
}

type MobileDataCardProps = {
  /** Summary line kept visible while collapsed — badge, title, timestamp. */
  header?: ReactNode;
  /** Label/value lines shown in the body. */
  rows?: MobileDataRow[];
  /** Buttons under the rows; three or more wrap into a two-column grid. */
  actions?: MobileDataAction[];
  /** Single-action shorthand. */
  action?: MobileDataAction;
  /** Free content at the bottom of the body. */
  footer?: ReactNode;
  /** Collapse the detail behind the header. Needs a `header` to make sense. */
  collapsible?: boolean;
  /** Start expanded. */
  defaultOpen?: boolean;
  className?: string;
  testId?: string;
};

/**
 * The mobile stand-in for a table row: a summary that stays visible and the
 * rest of the fields — plus the row's actions — folded behind a chevron.
 *
 * The body is mounted only while open rather than hidden with CSS, which is
 * what makes a list of these much cheaper than the table it replaces.
 */
export const MobileDataCard = memo(function MobileDataCard({
  header,
  rows,
  actions,
  action,
  footer,
  collapsible = true,
  defaultOpen = false,
  className,
  testId,
}: MobileDataCardProps) {
  const resolvedActions = actions ?? (action ? [action] : []);
  const detailRows = rows ?? [];
  const hasBody = detailRows.length > 0 || resolvedActions.length > 0 || Boolean(footer);
  const isCollapsible = collapsible && Boolean(header) && hasBody;

  const body = (
    <>
      {detailRows.length > 0 && (
        <div className="space-y-2.5">
          {detailRows.map((row, idx) => (
            <DetailRow key={idx} label={row.label} value={row.value} stacked={row.stacked} />
          ))}
        </div>
      )}
      {resolvedActions.length > 0 && <ActionRow actions={resolvedActions} />}
      {footer}
    </>
  );

  if (!isCollapsible) {
    return (
      <div
        data-testid={testId}
        className={cn(
          "space-y-3 rounded-2xl border border-foreground/10 bg-foreground/5 p-4",
          className
        )}
      >
        {header}
        {body}
      </div>
    );
  }

  return (
    <Collapsible
      data-testid={testId}
      defaultOpen={defaultOpen}
      className={cn(
        "group/card rounded-xl border border-foreground/10 bg-foreground/[0.025]",
        className
      )}
    >
      <CollapsibleTrigger className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-foreground/2">
        <div className="min-w-0 flex-1">{header}</div>
        <ChevronDown
          size={16}
          className="mt-0.5 shrink-0 text-foreground/40 transition-transform group-data-[state=open]/card:rotate-180"
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 border-t border-foreground/10 px-4 py-3 text-sm">
        {body}
      </CollapsibleContent>
    </Collapsible>
  );
});

/**
 * Standard collapsed summary: what identifies the row, plus at most one
 * supporting line. Anything else belongs in `rows`.
 */
export function CardSummary({
  title,
  subtitle,
  badge,
}: {
  /** What identifies the row: name, code, number. */
  title: ReactNode;
  /** One supporting line, e.g. a date or site. */
  subtitle?: ReactNode;
  /** Status badge shown before the title. */
  badge?: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {badge}
        <span className="truncate text-sm font-semibold text-foreground">{title}</span>
      </div>
      {subtitle && <p className="truncate text-xs text-foreground/50">{subtitle}</p>}
    </div>
  );
}

/**
 * Monospace ID, cut to `max` characters with the full value in the tooltip;
 * a muted dash when empty.
 */
export function IdCell({ value, max = 16 }: { value: string | null | undefined; max?: number }) {
  if (!value) return <span className="text-xs text-foreground/30">-</span>;
  return (
    <span className="truncate font-mono text-xs text-foreground/80" title={value}>
      {value.length > max ? value.slice(0, max) : value}
    </span>
  );
}

"use client";

import { cn } from "@mono/utils";
import { ArrowLeft } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Button } from "../ui/button.js";

export type PageHeaderAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  /** Hide the action (e.g. the user lacks the permission). Hide, don't disable. */
  hidden?: boolean;
  testId?: string;
  /**
   * Mobile shape. "icon" keeps the button in the title row with the label
   * hidden; "full" drops it into a full-width second row. Desktop is identical
   * either way.
   */
  mobile?: "icon" | "full";
};

/** Renders `back.href`. Pass your router's link (e.g. `next/link`) for client-side navigation. */
export type PageHeaderLinkComponent = ComponentType<{ href: string; children: ReactNode }>;

function DefaultLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href}>{children}</a>;
}

export type PageHeaderBack = {
  href?: string;
  onClick?: () => void;
  label?: string;
  testId?: string;
};

type PageHeaderProps = {
  /** Page title, rendered as the page's `<h1>` (truncated on overflow). */
  title: string;
  /** Small muted line under the title, e.g. a period or a record count. */
  subtitle?: ReactNode;
  /** Sub-pages only. Without `href`/`onClick` it goes back in history. */
  back?: PageHeaderBack;
  /** Leading control on top-level pages (no `back`), e.g. the app's sidebar/nav toggle. */
  leading?: ReactNode;
  /** Link used for `back.href`. Defaults to a plain `<a>`; pass your router's link. */
  linkComponent?: PageHeaderLinkComponent;
  /** Buttons on the trailing side. One stays inline on mobile; two or more form a 2-column grid. */
  actions?: PageHeaderAction[];
  /**
   * Free slot rendered on the trailing side, before the actions (date pills,
   * custom controls). On mobile it drops to a full-width row under the title.
   */
  children?: ReactNode;
  /** Applied to the header's root element. */
  className?: string;
};

function BackButton({
  back,
  linkComponent: Link = DefaultLink,
}: {
  back: PageHeaderBack;
  linkComponent?: PageHeaderLinkComponent;
}) {
  const label = back.label ?? "Kembali";

  const button = (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      data-testid={back.testId}
      onClick={back.href ? undefined : (back.onClick ?? (() => window.history.back()))}
      className="shrink-0 gap-1.5"
    >
      <ArrowLeft size={16} />
    </Button>
  );

  return back.href ? <Link href={back.href}>{button}</Link> : button;
}

function ActionButton({ action, fullWidth }: { action: PageHeaderAction; fullWidth?: boolean }) {
  const isFull = Boolean(fullWidth || action.mobile === "full");

  const button = (
    <Button
      type="button"
      variant={action.variant === "primary" ? "default" : "outline"}
      disabled={action.disabled}
      onClick={action.onClick}
      aria-label={action.label}
      data-testid={action.testId}
      className={cn("gap-1.5", isFull && "w-full md:w-fit")}
    >
      {action.icon}
      <span className={cn(!isFull && "hidden md:inline")}>{action.label}</span>
    </Button>
  );

  return button;
}

/**
 * The page header shared by every list/detail page.
 *
 * Mobile and desktop differ only through Tailwind `md:` classes, never through
 * `useIsMobile` — that hook reports desktop on the first render, so a JS branch
 * would paint the desktop header on phones until hydration landed.
 */
export function PageHeader({
  title,
  subtitle,
  back,
  leading,
  linkComponent,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const items = (actions ?? []).filter((action) => !action.hidden);
  // A trailing slot stacks under the title on mobile, so the row can't stay inline.
  const singleAction = items.length === 1 && !children;
  const shouldStackActions = items.length > 1;
  const actionsWrapperClass = shouldStackActions
    ? "grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:justify-end md:gap-2"
    : "flex items-center gap-2";

  return (
    <div
      className={cn(
        singleAction
          ? "flex items-center justify-between gap-3"
          : "grid grid-cols-1 items-start gap-3 md:flex md:items-center md:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {back ? <BackButton back={back} linkComponent={linkComponent} /> : leading}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-foreground md:text-xl">{title}</h1>
          {subtitle && <div className="truncate text-xs text-foreground/50">{subtitle}</div>}
        </div>
      </div>

      {(children || items.length > 0) && (
        <div
          className={cn(
            "flex min-w-0 items-center gap-2 md:w-auto md:shrink-0",
            (shouldStackActions || children) && "w-full"
          )}
        >
          {children}
          {items.length > 0 && (
            <div
              className={cn(
                "items-center md:flex md:w-auto md:shrink-0 md:grid-cols-none md:gap-2",
                actionsWrapperClass
              )}
            >
              {items.map((action) => (
                <ActionButton
                  key={action.label}
                  action={action}
                  fullWidth={Boolean(shouldStackActions && action.mobile === "full")}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

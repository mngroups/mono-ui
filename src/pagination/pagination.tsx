"use client";

import { cn, formatIndonesianNumber } from "@mono/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Ellipsis } from "lucide-react";
import { forwardRef } from "react";
import { PlainButton } from "../ui/plain-button.js";
import type { PageItem, PaginationProps } from "./pagination-types.js";
import {
  paginationEllipsisVariants,
  paginationNavButtonVariants,
  paginationPageButtonVariants,
  paginationVariants,
} from "./pagination-variants.js";

const JUMP = 5;

/** 5 pages around `page`, with ±5 jump buttons at the gaps. */
function getPageItems(page: number, totalPages: number): PageItem[] {
  const end = Math.min(totalPages, Math.max(1, page - 2) + 4);
  const start = Math.max(1, end - 4);
  const items: PageItem[] = [];
  if (start > 1) items.push("jump-back");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages) items.push("jump-forward");
  return items;
}

/**
 * Pager with a sliding 5-page window, ±5 jump buttons, Indonesian number
 * grouping (`24.312`) and Indonesian aria labels. Renders `nav > button`.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      total,
      current = 1,
      pageSize = 10,
      disabled = false,
      onChange,
      className,
      dataTestId,
      ...rest
    },
    ref
  ) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, current), totalPages);
    const goTo = (target: number) => {
      /* v8 ignore if -- @preserve every button that calls goTo is disabled when `disabled` is set */
      if (disabled) return;
      onChange?.(Math.min(Math.max(1, target), totalPages));
    };
    const isFirst = page <= 1;
    const isLast = page >= totalPages;

    return (
      <nav
        ref={ref}
        aria-label="Pagination"
        className={cn(paginationVariants(), className)}
        data-testid={dataTestId}
        {...rest}
      >
        <PlainButton
          type="button"
          aria-label="Halaman sebelumnya"
          className={paginationNavButtonVariants({ disabled: disabled || isFirst })}
          disabled={disabled || isFirst}
          aria-disabled={disabled || isFirst}
          onClick={() => goTo(page - 1)}
        >
          <ChevronLeft size={20} />
        </PlainButton>

        {getPageItems(page, totalPages).map((item) => {
          if (typeof item !== "number") {
            const back = item === "jump-back";
            const JumpIcon = back ? ChevronsLeft : ChevronsRight;
            return (
              <PlainButton
                key={item}
                type="button"
                aria-label={back ? `Mundur ${JUMP} halaman` : `Maju ${JUMP} halaman`}
                className={paginationEllipsisVariants({ disabled })}
                disabled={disabled}
                aria-disabled={disabled}
                onClick={() => goTo(back ? page - JUMP : page + JUMP)}
              >
                <Ellipsis size={20} className="group-hover:hidden" />
                <JumpIcon size={20} className="hidden group-hover:block" />
              </PlainButton>
            );
          }
          const active = item === page;
          return (
            <PlainButton
              key={item}
              type="button"
              aria-current={active ? "page" : undefined}
              className={paginationPageButtonVariants({ active, disabled })}
              disabled={disabled}
              aria-disabled={disabled}
              onClick={() => goTo(item)}
            >
              {formatIndonesianNumber(item)}
            </PlainButton>
          );
        })}

        <PlainButton
          type="button"
          aria-label="Halaman berikutnya"
          className={paginationNavButtonVariants({ disabled: disabled || isLast })}
          disabled={disabled || isLast}
          aria-disabled={disabled || isLast}
          onClick={() => goTo(page + 1)}
        >
          <ChevronRight size={20} />
        </PlainButton>
      </nav>
    );
  }
);

Pagination.displayName = "Pagination";

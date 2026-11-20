"use client";

import type { UploadItem } from "@mono/hooks/upload";
import { cn } from "@mono/utils";
import { CircleCheck, RotateCw, X } from "lucide-react";

import { PlainButton } from "../ui/plain-button.js";

/**
 * One file's upload progress / error / canceled / done marker. Renders nothing
 * for `idle`, so a dropzone without an upload queue looks unchanged. A canceled
 * file is never committed, so it must not look like an attached one.
 */
export function UploadState({
  item,
  onRetry,
  onCancel,
  className,
}: {
  item: UploadItem | undefined;
  onRetry?: (key: string) => void;
  onCancel?: (key: string) => void;
  className?: string;
}) {
  if (!item) return null;

  if (item.status === "uploading") {
    const percent = Math.round(item.progress * 100);
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          role="progressbar"
          aria-label={`Mengunggah ${item.file.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-foreground/10"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="w-9 shrink-0 text-right text-xs text-foreground/60 tabular-nums">
          {percent}%
        </span>
        {onCancel && (
          <PlainButton
            type="button"
            aria-label={`Batalkan unggah ${item.file.name}`}
            onClick={() => onCancel(item.key)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X size={14} />
          </PlainButton>
        )}
      </div>
    );
  }

  if (item.status === "error" || item.status === "canceled") {
    const isError = item.status === "error";
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs",
          isError ? "text-destructive" : "text-foreground/60",
          className
        )}
      >
        <span className="min-w-0 flex-1">{isError ? item.error : "Unggahan dibatalkan"}</span>
        {onRetry && (
          <PlainButton
            type="button"
            onClick={() => onRetry(item.key)}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <RotateCw size={12} />
            Ulangi
          </PlainButton>
        )}
      </div>
    );
  }

  if (item.status === "done") {
    return (
      <CircleCheck
        role="img"
        aria-label="Terunggah"
        size={16}
        className={cn("shrink-0 text-emerald-600 dark:text-emerald-400", className)}
      />
    );
  }

  return null;
}

"use client";

import { cn } from "@mono/utils";
import { Download } from "lucide-react";
import { StatusLabel } from "../status-label/status-label.js";
import { PlainButton } from "../ui/plain-button.js";
import { formatFileSize, type PreviewFile, type PreviewFileGroup } from "./file-kind.js";
import { FileTypeIcon } from "./file-type-icon.js";

export function FileList({
  groups,
  activeId,
  onSelect,
  onDownload,
}: {
  groups: PreviewFileGroup[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDownload: (file: PreviewFile) => void;
}) {
  return (
    <div className="divide-y divide-border/60">
      {groups.map((group) => (
        <section key={group.id} aria-label={group.label} className="py-2 first:pt-0 last:pb-0">
          {(group.label || group.timestamp) && (
            <div className="flex items-center gap-2 pt-2">
              {group.label && (
                <span className="min-w-0">
                  {group.labelClassName ? (
                    <span className={cn("whitespace-nowrap", group.labelClassName)}>
                      {group.label}
                    </span>
                  ) : (
                    <StatusLabel tone={group.tone}>{group.label}</StatusLabel>
                  )}
                </span>
              )}
              {group.timestamp && (
                <span className="ml-auto shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                  {group.timestamp}
                </span>
              )}
            </div>
          )}
          {group.note && <p className="pt-1.5 text-xs text-muted-foreground">{group.note}</p>}
          <ul className="mt-1 space-y-1">
            {group.files.map((file) => {
              const active = file.id === activeId;
              return (
                <li
                  key={file.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg pr-2 transition-colors",
                    active ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <PlainButton
                    type="button"
                    aria-current={active || undefined}
                    onClick={() => onSelect(file.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                  >
                    <FileTypeIcon file={file} size="sm" />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block truncate font-medium",
                          active ? "text-primary" : "text-foreground"
                        )}
                      >
                        {file.name}
                      </span>
                      {file.size != null && (
                        <span className="block text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      )}
                    </span>
                  </PlainButton>
                  <PlainButton
                    type="button"
                    aria-label={`Unduh ${file.name}`}
                    onClick={() => onDownload(file)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-foreground/10"
                  >
                    <Download size={18} />
                  </PlainButton>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

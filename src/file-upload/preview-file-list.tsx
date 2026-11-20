"use client";

import { fileKey, type UploadItem } from "@mono/hooks/upload";
import { cn } from "@mono/utils";
import { Eye, X } from "lucide-react";
import { lazy, type ReactNode, type Ref, Suspense, useState } from "react";

import { formatFileSize, type PreviewFile } from "../file-previewer/file-kind.js";
import { FileTypeIcon } from "../file-previewer/file-type-icon.js";
import { PlainButton } from "../ui/plain-button.js";
import type { UploadStateProps } from "./types.js";
import { UploadState } from "./upload-state.js";

// The previewer pulls in the PDF/DOCX viewers; load it only when a row is opened.
const FilePreviewer = lazy(() =>
  import("../file-previewer/file-previewer.js").then((m) => ({ default: m.FilePreviewer }))
);

/** The multi uploader's row look: icon, title, subtitle, "Lihat" and optional remove. */
export function FileRowButton({
  icon,
  title,
  subtitle,
  removeLabel,
  onOpen,
  onRemove,
  footer,
  className,
  testId,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string | null;
  removeLabel?: string;
  onOpen: () => void;
  onRemove?: () => void;
  /** Shown under the row, e.g. upload progress. */
  footer?: ReactNode;
  className?: string;
  /** The open button's `data-testid`; the remove button gets `<testId>-remove`. */
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-foreground/15 transition-colors focus-within:border-primary/60 hover:border-primary/60 hover:bg-primary/5",
        className
      )}
    >
      <div className="flex items-center gap-1 pr-2">
        <PlainButton
          type="button"
          title="Lihat preview"
          onClick={onOpen}
          data-testid={testId}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2.5 pl-3 text-left"
        >
          {icon}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary">
              {title}
            </span>
            {subtitle && (
              <span className="block truncate text-xs text-foreground/50">{subtitle}</span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors group-hover:bg-primary/10">
            <Eye size={14} />
            Lihat
          </span>
        </PlainButton>
        {onRemove && (
          <PlainButton
            type="button"
            aria-label={removeLabel ?? `Hapus ${title}`}
            onClick={onRemove}
            data-testid={testId && `${testId}-remove`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X size={18} />
          </PlainButton>
        )}
      </div>
      {footer && <div className="px-3 pb-2.5">{footer}</div>}
    </div>
  );
}

/** One row of the multi uploader's file list: the file's icon, name, size and upload state. */
export function PreviewFileRow({
  file,
  onOpen,
  onRemove,
  upload,
  onRetry,
  onCancel,
  className,
  testId,
}: {
  file: PreviewFile;
  onOpen: () => void;
  onRemove?: () => void;
  upload?: UploadItem;
  onRetry?: (key: string) => void;
  onCancel?: (key: string) => void;
  className?: string;
  testId?: string;
}) {
  const state = <UploadState item={upload} onRetry={onRetry} onCancel={onCancel} />;
  return (
    <FileRowButton
      icon={<FileTypeIcon file={{ name: file.name, url: file.url, mimeType: file.mimeType }} />}
      title={file.name}
      subtitle={file.size != null ? formatFileSize(file.size) : null}
      onOpen={onOpen}
      onRemove={onRemove}
      footer={upload && upload.status !== "idle" ? state : null}
      className={className}
      testId={testId}
    />
  );
}

/**
 * The multi uploader's file rows (icon, name, size, "Lihat" preview, optional
 * remove, upload state). Also lists files that already live on the server.
 */
export function PreviewFileList({
  files,
  onRemove,
  listRef,
  resolveUrl,
  sourceFiles,
  uploads,
  onRetry,
  onCancel,
}: {
  files: PreviewFile[];
  onRemove?: (file: PreviewFile) => void;
  listRef?: Ref<HTMLUListElement>;
  /** Fetches the URL of a server file that comes without one. */
  resolveUrl?: (file: PreviewFile) => Promise<string>;
  /** The local `File`s behind `files` (same order), to look up their upload state. */
  sourceFiles?: File[];
} & UploadStateProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  // Local files get their object URL a render later; hold the previewer until every file has one.
  const ready = files.length > 0 && (!!resolveUrl || files.every((file) => !!file.url));

  if (files.length === 0) return null;
  return (
    <>
      <ul ref={listRef} className="space-y-2">
        {files.map((file, index) => {
          const source = sourceFiles?.[index];
          return (
            <li key={file.id}>
              <PreviewFileRow
                file={file}
                onOpen={() => setPreviewId(file.id)}
                onRemove={onRemove ? () => onRemove(file) : undefined}
                upload={source ? uploads?.[fileKey(source)] : undefined}
                onRetry={onRetry}
                onCancel={onCancel}
              />
            </li>
          );
        })}
      </ul>
      {previewId !== null && (
        <Suspense fallback={null}>
          <FilePreviewer
            open={ready}
            onOpenChange={(open) => !open && setPreviewId(null)}
            files={files}
            initialFileId={previewId}
            resolveUrl={resolveUrl}
          />
        </Suspense>
      )}
    </>
  );
}

import type { UploadItem } from "@mono/hooks/upload";
import type { ReactNode } from "react";

/** Per-file upload state from `useUploadQueue().items`, keyed by `fileKey(file)`. */
export type UploadStateProps = {
  uploads?: Record<string, UploadItem>;
  onRetry?: (key: string) => void;
  onCancel?: (key: string) => void;
};

export interface BaseDropzoneProps extends UploadStateProps {
  /** Comma-separated extensions; only `.ext` entries are enforced. Default `DEFAULT_ACCEPT`. */
  accept?: string;
  /** Default 20. `0` disables the size check. */
  maxSizeMB?: number;
  className?: string;
  helperText?: string;
  /** Read-only: show the files but don't accept upload/replace. */
  readOnly?: boolean;
  /** Root `data-testid`; the hidden file input gets `<testId>-input`. */
  testId?: string;
}

export interface MultiFileDropzoneProps extends BaseDropzoneProps {
  multiple: true;
  value: File[];
  onChange: (files: File[]) => void;
  /** Default 5. */
  maxFiles?: number;
}

/**
 * What `transformFile` resolved to: keep the file (optionally with a warning
 * and whatever it parsed, e.g. GeoJSON, as `data`), or reject it.
 */
export type TransformResult = { file: File; warning?: string; data?: unknown } | { error: string };

export type SinglePreviewState = {
  /** The picked file (also while transforming or rejected), else `value`. */
  file: File | null;
  existingFileName?: string | null;
  existingFileUrl?: string | null;
  status: "idle" | "transforming" | "ok" | "warning" | "error";
  /** The warning or error text. */
  message?: string;
  /** `transformFile`'s `data` for the current file. */
  data?: unknown;
  /** Opens the file picker (no-op while read-only or uploading), for the slot's own "Ganti". */
  openPicker: () => void;
  readOnly: boolean;
};

export interface SingleFileDropzoneProps extends BaseDropzoneProps {
  multiple?: false;
  value: File | null;
  onChange: (file: File | null) => void;
  /** Name of a file already on the server (edit mode), shown when `value` is null. */
  existingFileName?: string | null;
  existingFileUrl?: string | null;
  /** Runs on a picked file before `onChange` (e.g. parse a shapefile). A throw becomes an error. */
  transformFile?: (file: File) => Promise<TransformResult>;
  /**
   * Called for every state, errors included. A non-null result **replaces** the
   * default body and message row (e.g. a map preview with its own "Ganti");
   * drops still land on the container. Return null to keep the default body.
   */
  preview?: (state: SinglePreviewState) => ReactNode;
  /** Overlay text while `transformFile` runs. Default "Memproses file…". */
  transformingLabel?: string;
}

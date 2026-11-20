"use client";

import { fileKey } from "@mono/hooks/upload";
import { cn, getErrorMessage } from "@mono/utils";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { PlainButton } from "../ui/plain-button.js";
import { Skeleton } from "../ui/skeleton.js";
import type { SingleFileDropzoneProps, SinglePreviewState } from "./types.js";
import { UploadState } from "./upload-state.js";
import { DEFAULT_ACCEPT, parseAcceptedExts, validateFile } from "./validate-file.js";

/** A picked file's transform state: running, or settled with a message and/or parsed data. */
type Pending = {
  file: File;
  status: "transforming" | "ok" | "warning" | "error";
  message?: string;
  data?: unknown;
};

export function SingleFileDropzone({
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 20,
  className,
  helperText,
  readOnly = false,
  testId,
  existingFileName,
  existingFileUrl,
  transformFile,
  preview,
  transformingLabel = "Memproses file…",
  uploads,
  onRetry,
  onCancel,
}: SingleFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickSeq = useRef(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const acceptedExts = parseAcceptedExts(accept);

  // A transform result only stands while `value` still matches it; a parent reset clears it.
  const shown =
    pending &&
    (pending.status === "transforming" ||
      ((pending.status === "ok" || pending.status === "warning") && value === pending.file) ||
      (pending.status === "error" && value === null))
      ? pending
      : null;

  const upload = value ? uploads?.[fileKey(value)] : undefined;
  const locked = readOnly || upload?.status === "uploading";
  const activeFile = shown?.file ?? value;
  const displayName = activeFile?.name ?? (existingFileName || null);
  const openPicker = () => {
    if (!locked) inputRef.current?.click();
  };
  const previewState: SinglePreviewState = {
    file: activeFile,
    existingFileName,
    existingFileUrl,
    status: shown?.status ?? (value ? "ok" : "idle"),
    message: shown?.message,
    data: shown?.data,
    openPicker,
    readOnly,
  };

  const acceptFile = async (file: File) => {
    const seq = ++pickSeq.current;
    const err = validateFile(file, acceptedExts, maxSizeMB);
    if (err) {
      setValidationError(err);
      setPending(null);
      onChange(null);
      return;
    }
    setValidationError(null);
    if (!transformFile) {
      setPending(null);
      onChange(file);
      return;
    }

    setPending({ file, status: "transforming" });
    const result = await transformFile(file).catch((error: unknown) => ({
      error: getErrorMessage(error),
    }));
    // A newer pick owns the dropzone now.
    if (seq !== pickSeq.current) return;
    if ("error" in result) {
      setPending({ file, status: "error", message: result.error });
      onChange(null);
    } else {
      setPending({
        file: result.file,
        status: result.warning ? "warning" : "ok",
        message: result.warning,
        data: result.data,
      });
      onChange(result.file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void acceptFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!locked && file) void acceptFile(file);
  };

  const extLabel = acceptedExts.map((ext) => ext.slice(1).toUpperCase()).join(", ");
  const isError = shown?.status === "error";
  const message = shown?.message;
  const slot = preview?.(previewState);
  const hasSlot = slot !== null && slot !== undefined && slot !== false;

  return (
    <div className="space-y-1.5" data-testid={testId}>
      <input
        ref={inputRef}
        data-testid={testId && `${testId}-input`}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <div
        data-dropzone
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "relative overflow-hidden rounded-xl border-2 transition-colors",
          validationError || isError
            ? "border-destructive bg-destructive/5"
            : shown?.status === "warning"
              ? "border-amber-500/40 bg-amber-500/5"
              : displayName
                ? activeFile
                  ? "border-primary bg-primary/5"
                  : "border-foreground/20 bg-foreground/5"
                : "border-dashed border-foreground/20",
          className
        )}
      >
        {hasSlot ? (
          <>
            {slot}
            {upload && upload.status !== "idle" && (
              <UploadState
                item={upload}
                onRetry={onRetry}
                onCancel={onCancel}
                className="border-t border-foreground/10 px-4 py-2.5"
              />
            )}
          </>
        ) : (
          <>
            <div
              onClick={openPicker}
              className={cn(
                "flex min-h-30 flex-col items-center justify-center gap-2 px-4 py-6",
                locked ? "cursor-default" : "cursor-pointer hover:bg-foreground/5"
              )}
            >
              {displayName ? (
                <>
                  <FileText
                    className={cn("h-8 w-8", activeFile ? "text-primary" : "text-foreground/40")}
                  />
                  <div className="w-full max-w-72 text-center">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        activeFile ? "text-foreground" : "text-foreground/60"
                      )}
                    >
                      {displayName}
                    </p>
                    {upload && upload.status !== "idle" ? (
                      <div
                        className="mt-1.5 flex justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <UploadState
                          item={upload}
                          onRetry={onRetry}
                          onCancel={onCancel}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      !locked &&
                      !message && <p className="mt-0.5 text-xs text-foreground/50">Ganti file</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-foreground/40" />
                  <div className="text-center">
                    <p className="text-sm text-foreground/60">
                      Klik untuk unggah dan pilih dokumen atau seret file ke sini
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/30">
                      {helperText ?? `${extLabel} – maks. ${maxSizeMB} MB`}
                    </p>
                  </div>
                </>
              )}
            </div>

            {message && (
              <div className="flex items-start gap-2 border-t border-foreground/10 px-4 py-3">
                <AlertCircle
                  size={14}
                  className={cn(
                    "mt-0.5 shrink-0",
                    isError ? "text-destructive" : "text-amber-600 dark:text-amber-400"
                  )}
                />
                <span
                  className={cn(
                    "flex-1 text-xs",
                    isError ? "text-destructive" : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {message}
                </span>
                {!readOnly && (
                  <PlainButton
                    type="button"
                    onClick={openPicker}
                    className="shrink-0 rounded-lg border border-primary/40 px-2 py-1 text-xs transition-colors hover:border-primary/70 hover:bg-primary/10"
                  >
                    Ganti
                  </PlainButton>
                )}
              </div>
            )}
          </>
        )}

        {shown?.status === "transforming" && (
          <div className="absolute inset-0 flex min-h-30 flex-col items-center justify-center gap-2 bg-background/80">
            <Skeleton className="h-2 w-32 rounded-full" />
            <p className="text-xs text-foreground/60">{transformingLabel}</p>
          </div>
        )}
      </div>
      {validationError && (
        <div className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}

"use client";

import { fileKey } from "@mono/hooks/upload";
import { cn } from "@mono/utils";
import { AlertCircle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { PreviewFile } from "../file-previewer/file-kind.js";
import { PreviewFileList } from "./preview-file-list.js";
import type { MultiFileDropzoneProps } from "./types.js";
import {
  DEFAULT_ACCEPT,
  parseAcceptedExts,
  uniqueFileName,
  validateFile,
} from "./validate-file.js";

export function MultiFileDropzone({
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 20,
  maxFiles = 5,
  className,
  helperText,
  readOnly = false,
  testId,
  uploads,
  onRetry,
  onCancel,
}: MultiFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const scrollToNewest = useRef(false);
  const [previewUrls, setPreviewUrls] = useState<Map<File, string> | null>(null);
  const acceptedExts = parseAcceptedExts(accept);

  // Object URLs only reference the File (no copy); they back the thumbnails and the previewer.
  useEffect(() => {
    const urls = new Map(value.map((file) => [file, URL.createObjectURL(file)]));
    setPreviewUrls(urls);
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      setPreviewUrls(null);
    };
  }, [value]);

  const previewFiles: PreviewFile[] = value.map((file) => ({
    id: fileKey(file),
    name: file.name,
    size: file.size,
    mimeType: file.type || undefined,
    url: previewUrls?.get(file) ?? "",
  }));

  const addFiles = (incoming: File[]) => {
    const takenNames = new Set(value.map((f) => f.name));
    const accepted: File[] = [];
    let nextError: string | null = null;
    for (const file of incoming) {
      const err = validateFile(file, acceptedExts, maxSizeMB);
      if (err) {
        nextError = err;
        continue;
      }
      if (value.length + accepted.length >= maxFiles) {
        nextError = `Maksimal ${maxFiles} file.`;
        break;
      }
      const name = uniqueFileName(file.name, takenNames);
      takenNames.add(name);
      accepted.push(
        name === file.name
          ? file
          : new File([file], name, { type: file.type, lastModified: file.lastModified })
      );
    }
    setError(nextError);
    if (accepted.length) {
      scrollToNewest.current = true;
      onChange([...value, ...accepted]);
    }
  };

  // New files land below the dropzone, often outside a scrolling modal's view.
  useEffect(() => {
    if (!scrollToNewest.current) return;
    scrollToNewest.current = false;
    listRef.current?.lastElementChild?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files ?? []));
  };

  const removeFile = (file: PreviewFile) => {
    setError(null);
    onChange(value.filter((f) => fileKey(f) !== file.id));
  };

  const extLabel = acceptedExts.map((ext) => ext.slice(1).toUpperCase()).join(", ");

  return (
    <div className="space-y-2" data-testid={testId}>
      {!readOnly && value.length < maxFiles && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "flex min-h-30 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors",
            error
              ? "border-destructive bg-destructive/5"
              : "border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5",
            className
          )}
        >
          <input
            ref={inputRef}
            data-testid={testId && `${testId}-input`}
            type="file"
            multiple
            accept={accept}
            className="hidden"
            onChange={handleChange}
          />
          <Upload className="h-8 w-8 text-foreground/40" />
          <div className="text-center">
            <p className="text-sm text-foreground/60">
              Klik untuk unggah dan pilih dokumen atau seret file ke sini
            </p>
            <p className="mt-0.5 text-xs text-foreground/30">
              {helperText ??
                `Bisa beberapa file ${extLabel} – maks. ${maxSizeMB} MB & ${maxFiles} file`}
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <PreviewFileList
        files={previewFiles}
        sourceFiles={value}
        listRef={listRef}
        onRemove={readOnly ? undefined : removeFile}
        uploads={uploads}
        onRetry={onRetry}
        onCancel={onCancel}
      />
    </div>
  );
}

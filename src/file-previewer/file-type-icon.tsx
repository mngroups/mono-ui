"use client";

import { cn } from "@mono/utils";
import {
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { getFileKind, type PreviewFile } from "./file-kind.js";

type IconStyle = { icon: LucideIcon; tone: string };

const PDF: IconStyle = { icon: FileText, tone: "bg-red-500/10 text-red-600 dark:text-red-400" };
const IMAGE: IconStyle = {
  icon: FileImage,
  tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};
const WORD: IconStyle = { icon: FileText, tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400" };
const SHEET: IconStyle = {
  icon: FileSpreadsheet,
  tone: "bg-green-500/10 text-green-700 dark:text-green-400",
};
const ARCHIVE: IconStyle = {
  icon: FileArchive,
  tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};
const OTHER: IconStyle = { icon: File, tone: "bg-foreground/5 text-foreground/60" };

const BY_EXT: Record<string, IconStyle> = {
  doc: WORD,
  docx: WORD,
  xls: SHEET,
  xlsx: SHEET,
  csv: SHEET,
  zip: ARCHIVE,
  rar: ARCHIVE,
  "7z": ARCHIVE,
};

function iconStyleOf(file: Pick<PreviewFile, "name" | "url" | "mimeType">): IconStyle {
  const kind = getFileKind(file);
  if (kind === "pdf") return PDF;
  if (kind === "image") return IMAGE;
  if (kind === "docx") return WORD;
  // split() always returns at least one element, so pop() is never undefined.
  return BY_EXT[file.name.split(".").pop()!.toLowerCase()] ?? OTHER;
}

export function FileTypeIcon({
  file,
  size = "md",
  className,
}: {
  file: Pick<PreviewFile, "name" | "url" | "mimeType">;
  size?: "sm" | "md";
  className?: string;
}) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const box = cn("shrink-0 rounded-lg", size === "sm" ? "h-8 w-8" : "h-9 w-9");

  if (file.url && !thumbnailFailed && getFileKind(file) === "image") {
    return (
      <img
        src={file.url}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        onError={() => setThumbnailFailed(true)}
        className={cn(box, "border border-foreground/10 object-cover", className)}
      />
    );
  }

  const { icon: Icon, tone } = iconStyleOf(file);
  return (
    <span aria-hidden className={cn(box, "flex items-center justify-center", tone, className)}>
      <Icon size={size === "sm" ? 16 : 18} />
    </span>
  );
}

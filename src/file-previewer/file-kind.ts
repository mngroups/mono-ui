import type { StatusTone } from "../status-label/status-label.js";

export interface PreviewFile {
  id: string;
  name: string;
  /** Empty when `FilePreviewer`'s `resolveUrl` fetches it on open. */
  url: string;
  size?: number;
  mimeType?: string;
}

export interface PreviewFileGroup {
  id: string;
  label?: string;
  tone?: StatusTone;
  /** A feature's own badge classes for the label, used instead of the `tone` StatusLabel. */
  labelClassName?: string;
  timestamp?: string;
  note?: string;
  files: PreviewFile[];
}

export type FileKind = "image" | "pdf" | "docx" | "other";

const EXT_KIND: Record<string, FileKind> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  bmp: "image",
  svg: "image",
  heic: "image",
  heif: "image",
  pdf: "pdf",
  docx: "docx",
};

const HEIC_MIMES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function extensionOf(value: string): string {
  const path = value.split(/[?#]/)[0];
  const dot = path.lastIndexOf(".");
  return dot === -1 ? "" : path.slice(dot + 1).toLowerCase();
}

/** How a file can be previewed, from its MIME type first, then the extension of its name or URL. */
export function getFileKind({
  name,
  url,
  mimeType,
}: Pick<PreviewFile, "name" | "url" | "mimeType">): FileKind {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === DOCX_MIME) return "docx";
  return EXT_KIND[extensionOf(name)] ?? EXT_KIND[extensionOf(url)] ?? "other";
}

export function isHeicFile({
  name,
  url,
  mimeType,
}: Pick<PreviewFile, "name" | "url" | "mimeType">) {
  if (mimeType && HEIC_MIMES.has(mimeType)) return true;
  return [extensionOf(name), extensionOf(url)].some((ext) => ext === "heic" || ext === "heif");
}

/** Only Safari decodes HEIC natively — elsewhere convert to JPEG; the decoder loads on first use. */
export async function heicToObjectUrl(url: string): Promise<string> {
  const [{ heicTo }, blob] = await Promise.all([import("heic-to"), fetchBlob(url)]);
  const jpeg = await heicTo({ blob, type: "image/jpeg", quality: 0.9 });
  return URL.createObjectURL(jpeg);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fetchBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

export function openInNewTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Presigned URLs are cross-origin, where `<a download>` is ignored — fetch as a blob first. */
export async function downloadFile({ name, url }: Pick<PreviewFile, "name" | "url">) {
  try {
    const href = url.startsWith("blob:") ? url : URL.createObjectURL(await fetchBlob(url));
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
    if (href !== url) setTimeout(() => URL.revokeObjectURL(href), 0);
  } catch {
    openInNewTab(url);
  }
}

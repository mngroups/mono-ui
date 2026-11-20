"use client";

import { useZoomPan } from "@mono/hooks";
import { cn } from "@mono/utils";
import { ArrowLeft, Download, ExternalLink, ZoomIn, ZoomOut } from "lucide-react";
import {
  type CSSProperties,
  lazy,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PlainButton } from "../ui/plain-button.js";
import { Skeleton } from "../ui/skeleton.js";
import {
  downloadFile,
  getFileKind,
  heicToObjectUrl,
  isHeicFile,
  openInNewTab,
  type PreviewFile,
} from "./file-kind.js";
import { UnsupportedViewer } from "./unsupported-viewer.js";

function PageSkeleton() {
  return (
    <div className="h-full p-4">
      <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-xl rounded-md" />
    </div>
  );
}

// Code-split: pdf.js and docx-preview load only when such a file is opened.
const PdfViewer = lazy(() => import("./pdf-viewer.js"));
const DocxViewer = lazy(() => import("./docx-viewer.js"));

/** Client-only, like next/dynamic `ssr: false`: the viewers touch browser APIs at import. */
function ClientViewer({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <PageSkeleton />;
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

const ZOOM_STEP = 0.25;

/** Tries the image natively first; a HEIC the browser can't decode is converted to JPEG. */
function ImageView({
  file,
  transform,
  onError,
}: {
  file: PreviewFile;
  transform: CSSProperties["transform"];
  onError: () => void;
}) {
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    if (!convertedUrl) return;
    return () => URL.revokeObjectURL(convertedUrl);
  }, [convertedUrl]);

  const handleError = () => {
    if (convertedUrl || !isHeicFile(file)) return onError();
    setConverting(true);
    heicToObjectUrl(file.url).then(
      (url) => {
        if (unmounted.current) return URL.revokeObjectURL(url);
        setConvertedUrl(url);
        setConverting(false);
      },
      () => !unmounted.current && onError()
    );
  };

  if (converting) return <Skeleton className="aspect-[4/3] w-full max-w-xl rounded-lg" />;

  return (
    <img
      src={convertedUrl ?? file.url}
      alt={file.name}
      draggable={false}
      onError={handleError}
      className="max-h-full max-w-full rounded-lg object-contain transition-transform"
      style={{ transform }}
    />
  );
}

const ICON_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40";

export function PreviewPane({ file, onBack }: { file: PreviewFile; onBack?: () => void }) {
  const kind = getFileKind(file);
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const { scale, zoomTo, canZoomIn, canZoomOut, transform, handlers } = useZoomPan({
    min: 0.5,
    max: 4,
  });
  const download = () => downloadFile(file);
  const previewable = kind !== "other" && !failed;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b border-border/60 px-2 py-1.5">
        {onBack && (
          <PlainButton
            type="button"
            aria-label="Kembali ke daftar file"
            onClick={onBack}
            className={cn(ICON_BUTTON, "md:hidden")}
          >
            <ArrowLeft size={18} />
          </PlainButton>
        )}
        <p className="min-w-0 flex-1 truncate px-1 text-sm font-medium text-foreground">
          {file.name}
        </p>
        {previewable && (
          <>
            <PlainButton
              type="button"
              aria-label="Perkecil"
              disabled={!canZoomOut}
              onClick={() => zoomTo(scale - ZOOM_STEP)}
              className={ICON_BUTTON}
            >
              <ZoomOut size={18} />
            </PlainButton>
            <span className="w-11 text-center text-xs text-muted-foreground tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <PlainButton
              type="button"
              aria-label="Perbesar"
              disabled={!canZoomIn}
              onClick={() => zoomTo(scale + ZOOM_STEP)}
              className={ICON_BUTTON}
            >
              <ZoomIn size={18} />
            </PlainButton>
          </>
        )}
        <PlainButton
          type="button"
          aria-label="Buka di tab baru"
          onClick={() => openInNewTab(file.url)}
          className={ICON_BUTTON}
        >
          <ExternalLink size={18} />
        </PlainButton>
        <PlainButton type="button" aria-label="Unduh" onClick={download} className={ICON_BUTTON}>
          <Download size={18} />
        </PlainButton>
      </div>

      <div className="min-h-0 flex-1" data-vaul-no-drag>
        {!previewable ? (
          <UnsupportedViewer
            onDownload={download}
            {...(failed && {
              title: "File Gagal Dimuat",
              description: "Berkas tidak bisa dimuat. Buka di tab baru atau unduh berkas.",
            })}
          />
        ) : kind === "image" ? (
          <div
            className={cn(
              "flex h-full touch-none items-center justify-center overflow-hidden p-4 select-none",
              scale > 1 && "cursor-grab active:cursor-grabbing"
            )}
            {...handlers}
          >
            <ImageView file={file} transform={transform} onError={onError} />
          </div>
        ) : kind === "pdf" ? (
          <ClientViewer>
            <PdfViewer url={file.url} scale={scale} onError={onError} />
          </ClientViewer>
        ) : (
          <ClientViewer>
            <DocxViewer url={file.url} scale={scale} onError={onError} />
          </ClientViewer>
        )}
      </div>
    </div>
  );
}

"use client";

import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
  type RenderTask,
} from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton.js";
import { useElementWidth } from "./use-element-width.js";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Keeps a zoomed page's backing canvas within mobile WebView memory limits.
const MAX_CANVAS_PIXELS = 16_777_216;
const A4_RATIO = Math.SQRT2;

function PdfPage({
  doc,
  pageNumber,
  width,
  ratio,
  root,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  ratio: number;
  root: HTMLElement | null;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const el = holderRef.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { root, rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [root, visible]);

  useEffect(() => {
    if (!visible || !width) return;
    let task: RenderTask | null = null;
    let cancelled = false;

    doc.getPage(pageNumber).then((page) => {
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      const cssViewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        Math.sqrt(MAX_CANVAS_PIXELS / (cssViewport.width * cssViewport.height))
      );
      const viewport = page.getViewport({ scale: cssViewport.scale * pixelRatio });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${cssViewport.width}px`;
      canvas.style.height = `${cssViewport.height}px`;
      task = page.render({ canvas, viewport });
      task.promise.then(
        () => !cancelled && setRendered(true),
        () => {}
      );
    });

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, width, visible]);

  return (
    <div
      ref={holderRef}
      className="relative mx-auto bg-white shadow-sm"
      style={{ width, minHeight: rendered ? undefined : width * ratio }}
    >
      {!rendered && <Skeleton className="absolute inset-0" />}
      <canvas ref={canvasRef} aria-label={`Halaman ${pageNumber}`} className="block" />
    </div>
  );
}

export default function PdfViewer({
  url,
  scale,
  onError,
}: {
  url: string;
  scale: number;
  onError: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerWidth = useElementWidth(scrollRef);
  const [state, setState] = useState<{ doc: PDFDocumentProxy; ratio: number } | null>(null);

  useEffect(() => {
    const task = getDocument({ url });
    task.promise
      .then(async (doc) => {
        const { width, height } = (await doc.getPage(1)).getViewport({ scale: 1 });
        setState({ doc, ratio: height / width || A4_RATIO });
      })
      .catch((err: Error) => {
        if (err?.name !== "AbortException") onError();
      });
    return () => {
      task.destroy();
    };
  }, [url, onError]);

  const pageWidth = Math.floor(containerWidth * scale);

  return (
    <div ref={scrollRef} className="scrollbar-modern h-full overflow-auto p-4">
      {state && pageWidth > 0 ? (
        <div className="flex w-max min-w-full flex-col gap-4">
          {Array.from({ length: state.doc.numPages }, (_, i) => (
            <PdfPage
              key={i}
              doc={state.doc}
              pageNumber={i + 1}
              width={pageWidth}
              ratio={state.ratio}
              root={scrollRef.current}
            />
          ))}
        </div>
      ) : (
        <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-xl rounded-md" />
      )}
    </div>
  );
}

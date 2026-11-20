"use client";

import { renderAsync } from "docx-preview";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton.js";
import { fetchBlob } from "./file-kind.js";
import { useElementWidth } from "./use-element-width.js";

export default function DocxViewer({
  url,
  scale,
  onError,
}: {
  url: string;
  scale: number;
  onError: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const containerWidth = useElementWidth(scrollRef);
  const [docWidth, setDocWidth] = useState(0);

  useEffect(() => {
    const el = docRef.current;
    /* v8 ignore if -- @preserve ref null-check: the target div is always rendered */
    if (!el) return;
    let cancelled = false;
    fetchBlob(url)
      .then((blob) =>
        cancelled ? undefined : renderAsync(blob, el, undefined, { breakPages: true })
      )
      .then(() => !cancelled && setDocWidth(el.scrollWidth))
      .catch(() => !cancelled && onError());
    return () => {
      cancelled = true;
      el.replaceChildren();
    };
  }, [url, onError]);

  // Fit the page width to the pane, then apply the toolbar zoom on top.
  const fit = docWidth && containerWidth ? Math.min(1, containerWidth / docWidth) : 1;

  return (
    <div ref={scrollRef} className="scrollbar-modern relative h-full overflow-auto p-4">
      {!docWidth && <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-xl rounded-md" />}
      <div
        ref={docRef}
        className="w-max [&_.docx-wrapper]:bg-transparent! [&_.docx-wrapper]:p-0! [&_section.docx]:mb-4!"
        style={{ zoom: fit * scale, visibility: docWidth ? "visible" : "hidden" }}
      />
    </div>
  );
}

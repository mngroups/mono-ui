"use client";

import { cn } from "@mono/utils";

interface DataNotAvailableProps {
  /** Illustration URL (e.g. "/empty-2.png" from the app's public folder). Omit for text only. */
  image?: string;
  /** Ukuran gambar dalam px (width = height). Default: 120 */
  imageSize?: number;
  /** Heading text. Default: "Data belum tersedia". */
  title?: string;
  /** Teks deskripsi. Pass `null` untuk menyembunyikan. */
  description?: string | null;
  /** Extra classes for the outer box, e.g. a different `min-h-*`. */
  className?: string;
  /** Jika diisi, gambar menjadi clickable dan memanggil handler ini. */
  onImageClick?: () => void;
}

/**
 * Global "Data belum tersedia" empty state. Big centered illustration + copy —
 * reserves the content area so there's no layout shift when the real data
 * arrives. Gambar & teks bisa dikustom lewat props.
 */
export function DataNotAvailable({
  image,
  imageSize = 120,
  title = "Data belum tersedia",
  description = "Data untuk periode ini belum tersedia atau belum diperbarui. Silahkan coba beberapa saat lagi",
  className,
  onImageClick,
}: DataNotAvailableProps = {}) {
  return (
    <div
      className={cn(
        "flex min-h-[420px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] px-6 py-16 text-center",
        className
      )}
    >
      {image ? (
        <img
          src={image}
          alt=""
          width={imageSize}
          height={imageSize}
          className={onImageClick ? "cursor-pointer" : undefined}
          onClick={onImageClick}
        />
      ) : null}
      <div>
        <p className="text-lg font-bold text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-sm text-foreground/50">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

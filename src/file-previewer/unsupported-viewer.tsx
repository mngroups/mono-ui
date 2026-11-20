"use client";

import { Download, File } from "lucide-react";
import { Button } from "../ui/button.js";

export function UnsupportedViewer({
  onDownload,
  title = "File Tidak Bisa Dibuka di Sini",
  description = "Berkas ini tidak bisa ditampilkan di sini. Unduh berkas untuk membukanya di aplikasi Anda.",
}: {
  onDownload: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <File size={72} strokeWidth={1.25} className="text-primary/70" />
      <p className="mt-2 font-semibold text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button size="sm" onClick={onDownload} className="mt-2">
        <Download size={16} />
        Unduh file
      </Button>
    </div>
  );
}

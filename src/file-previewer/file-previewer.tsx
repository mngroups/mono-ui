"use client";

import { cn } from "@mono/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DynamicModal } from "../dynamic-modal/dynamic-modal.js";
import { Button } from "../ui/button.js";
import { Skeleton } from "../ui/skeleton.js";
import { toast } from "../ui/toast.js";
import { downloadFile, type PreviewFile, type PreviewFileGroup } from "./file-kind.js";
import { FileList } from "./file-list.js";
import { PreviewPane } from "./preview-pane.js";

export type { PreviewFile, PreviewFileGroup };

export interface FilePreviewerProps {
  /** Controlled open state. */
  open: boolean;
  /** Called when the modal is dismissed or "Tutup" is pressed. */
  onOpenChange: (open: boolean) => void;
  /** Flat list; use `groups` instead for labelled sections. */
  files?: PreviewFile[];
  /** Labelled sections of files (e.g. per revision), shown with a status label and timestamp. */
  groups?: PreviewFileGroup[];
  /** File shown first when opened; defaults to the first file. */
  initialFileId?: string | null;
  /** Modal title; defaults to "Attachment (n)". */
  title?: string;
  /**
   * Fetches a file's URL when it is opened, for files listed without one (e.g. presigned links
   * that expire). Downloading every file still resolves them one by one unless `onDownloadAll`
   * is given.
   */
  resolveUrl?: (file: PreviewFile) => Promise<string>;
  /** Replaces "Unduh Semua" downloading each file, e.g. with a server-made zip. */
  onDownloadAll?: () => Promise<void>;
  /** Called when a file can't be downloaded; defaults to an error toast ("Gagal mengunduh …"). */
  onDownloadError?: (file: PreviewFile, error: unknown) => void;
}

// Presigned links last an hour; refetch well before that.
const RESOLVED_URL_STALE_MS = 30 * 60_000;

function ResolvedPreviewPane({
  file,
  resolveUrl,
  onBack,
}: {
  file: PreviewFile;
  resolveUrl: (file: PreviewFile) => Promise<string>;
  onBack?: () => void;
}) {
  const query = useQuery({
    queryKey: ["file-previewer", "url", file.id],
    queryFn: () => resolveUrl(file),
    staleTime: RESOLVED_URL_STALE_MS,
    retry: false,
  });
  if (query.data) return <PreviewPane file={{ ...file, url: query.data }} onBack={onBack} />;
  if (query.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-muted-foreground">Gagal memuat file.</p>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          Coba lagi
        </Button>
      </div>
    );
  }
  return (
    <div className="h-full p-4">
      <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-xl rounded-md" />
    </div>
  );
}

/**
 * Modal (bottom sheet on mobile) that previews attachments: images with zoom and pan, PDFs and
 * `.docx` documents, with a download prompt for anything else. Several files get a file list,
 * optionally grouped. Needs a TanStack Query `QueryClientProvider`.
 */
export function FilePreviewer({
  open,
  onOpenChange,
  files,
  groups,
  initialFileId,
  title,
  resolveUrl,
  onDownloadAll,
  onDownloadError,
}: FilePreviewerProps) {
  const allGroups = useMemo(() => groups ?? [{ id: "files", files: files ?? [] }], [groups, files]);
  const allFiles = useMemo(() => allGroups.flatMap((g) => g.files), [allGroups]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Mobile is single-column: either the list or the preview is shown.
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    if (open) return;
    setSelectedId(null);
    setListOpen(false);
  }, [open]);

  const activeFile =
    allFiles.find((f) => f.id === (selectedId ?? initialFileId)) ?? allFiles[0] ?? null;
  const multiple = allFiles.length > 1;
  const showListOnMobile = multiple && (listOpen || (!selectedId && !initialFileId));

  const download = async (file: PreviewFile) => {
    try {
      await downloadFile(resolveUrl ? { ...file, url: await resolveUrl(file) } : file);
    } catch (error) {
      if (onDownloadError) onDownloadError(file, error);
      else toast.error(`Gagal mengunduh ${file.name}`);
    }
  };

  const downloadAll = async () => {
    if (onDownloadAll) return onDownloadAll();
    for (const file of allFiles) await download(file);
  };

  return (
    <DynamicModal
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? `Attachment (${allFiles.length})`}
      dismissible
      mobileFullHeight
      modalWidth={multiple ? "60rem" : "48rem"}
      testId="file-previewer"
      footer={
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          {multiple && (
            <Button variant="outline" onClick={downloadAll} className="w-full md:w-auto">
              Unduh Semua
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} className="w-full md:w-auto md:min-w-25">
            Tutup
          </Button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 gap-4 md:h-[min(40rem,70vh)] md:flex-none">
        {multiple && (
          <aside
            aria-label="Daftar file"
            className={cn(
              "scrollbar-modern min-h-0 overflow-y-auto md:w-80 md:shrink-0",
              showListOnMobile ? "max-md:flex-1" : "max-md:hidden"
            )}
          >
            <FileList
              groups={allGroups}
              // The list only renders with 2+ files, so there is always an active file.
              activeId={activeFile!.id}
              onDownload={download}
              onSelect={(id) => {
                setSelectedId(id);
                setListOpen(false);
              }}
            />
          </aside>
        )}
        {activeFile && (
          <div
            className={cn(
              "min-h-0 flex-1 overflow-hidden rounded-xl bg-muted/60",
              showListOnMobile && "max-md:hidden"
            )}
          >
            {resolveUrl ? (
              <ResolvedPreviewPane
                key={activeFile.id}
                file={activeFile}
                resolveUrl={resolveUrl}
                onBack={multiple ? () => setListOpen(true) : undefined}
              />
            ) : (
              <PreviewPane
                key={activeFile.id}
                file={activeFile}
                onBack={multiple ? () => setListOpen(true) : undefined}
              />
            )}
          </div>
        )}
      </div>
    </DynamicModal>
  );
}

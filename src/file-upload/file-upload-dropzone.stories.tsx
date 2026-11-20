import type { UploadItem } from "@mono/hooks/upload";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { PlainButton } from "../ui/plain-button.js";
import { FileUploadDropzone } from "./file-upload-dropzone.js";
import type { TransformResult } from "./types.js";

function StoryQueryClient({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const withQueryClient: Decorator = (Story) => (
  <StoryQueryClient>
    <div className="max-w-md">
      <Story />
    </div>
  </StoryQueryClient>
);

const sample = (name: string) =>
  new File([new Uint8Array(180_000)], name, { type: "application/pdf", lastModified: 1 });
const keyOf = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;

function SingleDemo({ transform }: { transform?: (file: File) => Promise<TransformResult> }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <FileUploadDropzone
      value={file}
      onChange={setFile}
      accept=".pdf,.zip"
      transformFile={transform}
      preview={({ status, file, message, data, openPicker }) =>
        transform && file && status !== "transforming" ? (
          // A real app renders its map here; this stands in for it.
          <div className="flex flex-col gap-2 p-4 text-xs">
            <div className="flex h-24 items-center justify-center rounded-lg bg-foreground/5 text-foreground/50">
              {status === "error" ? message : `Pratinjau peta (${String(data ?? "tanpa data")})`}
            </div>
            {status === "warning" && (
              <p className="text-amber-600 dark:text-amber-400">{message}</p>
            )}
            <div className="flex items-center gap-2">
              <span className="flex-1 truncate">{file.name}</span>
              <PlainButton
                type="button"
                onClick={openPicker}
                className="rounded-lg border border-primary/40 px-2 py-1 hover:bg-primary/10"
              >
                Ganti
              </PlainButton>
            </div>
          </div>
        ) : null
      }
    />
  );
}

function MultipleDemo({ uploads }: { uploads?: (files: File[]) => Record<string, UploadItem> }) {
  const [files, setFiles] = useState<File[]>(
    uploads ? [sample("laporan.pdf"), sample("foto-unit.pdf"), sample("berita-acara.pdf")] : []
  );
  return (
    <FileUploadDropzone
      multiple
      value={files}
      onChange={setFiles}
      uploads={uploads?.(files)}
      onRetry={() => {}}
      onCancel={() => {}}
    />
  );
}

const meta = {
  title: "Components/FileUploadDropzone",
  decorators: [withQueryClient],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { render: () => <SingleDemo /> };

/** Resolves to `result` after a short pause, like a real parse would. */
const after = <T,>(result: T) => new Promise<T>((r) => setTimeout(() => r(result), 1200));

export const SingleTransformOk: Story = {
  name: "Single — transformFile ok",
  render: () => <SingleDemo transform={(file) => after({ file, data: "3 poligon" })} />,
};

export const SingleTransformWarning: Story = {
  name: "Single — transformFile warning",
  render: () => (
    <SingleDemo
      transform={(file) =>
        after({ file, warning: "Sebagian fitur tidak memiliki koordinat dan dilewati." })
      }
    />
  ),
};

export const SingleTransformError: Story = {
  name: "Single — transformFile error",
  render: () => <SingleDemo transform={() => after({ error: "Shapefile tidak valid." })} />,
};

export const Multiple: Story = { render: () => <MultipleDemo /> };

export const MultipleUploadStates: Story = {
  name: "Multiple — upload states",
  render: () => (
    <MultipleDemo
      uploads={(files) => {
        const states: Partial<UploadItem>[] = [
          { status: "uploading", progress: 0.42 },
          { status: "error", error: "Gagal mengunggah foto-unit.pdf. Silakan coba lagi." },
          { status: "done", progress: 1 },
        ];
        return Object.fromEntries(
          files.map((file, i) => [
            keyOf(file),
            { key: keyOf(file), file, status: "idle", progress: 0, ...states[i] } as UploadItem,
          ])
        );
      }}
    />
  ),
};

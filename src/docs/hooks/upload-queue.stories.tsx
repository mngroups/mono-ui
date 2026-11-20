import { type UploadTarget, type UploadTransport, useUploadQueue } from "@mono/hooks/upload";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { FileUploadDropzone } from "../../file-upload/file-upload-dropzone.js";
import { Button } from "../../ui/button.js";

// No storage here: presign answers instantly and the transport ticks progress on a timer.
const fakePresign = async (file: File): Promise<UploadTarget> => ({
  uploadId: `demo-${file.name}`,
  url: "https://storage.example/presigned",
});

const fakeTransport: UploadTransport = (_target, file, { signal, onProgress }) =>
  new Promise((resolve, reject) => {
    let loaded = 0;
    const timer = setInterval(() => {
      loaded = Math.min(file.size, loaded + file.size / 10);
      onProgress(loaded, file.size);
      if (loaded >= file.size) {
        clearInterval(timer);
        if (file.name.includes("gagal"))
          reject(new Error(`Gagal mengunggah ${file.name}. Silakan coba lagi.`));
        else resolve();
      }
    }, 250);
    signal.addEventListener("abort", () => {
      clearInterval(timer);
      reject(new DOMException("Dibatalkan", "AbortError"));
    });
  });

function QueueDemo({ mode }: { mode: "onSelect" | "onSubmit" }) {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<string>("");
  const queue = useUploadQueue({ mode, presign: fakePresign, transport: fakeTransport });
  return (
    <div className="flex max-w-md flex-col gap-3">
      <FileUploadDropzone
        multiple
        value={files}
        onChange={(next) => {
          setFiles(next);
          queue.sync(next);
        }}
        uploads={queue.items}
        onRetry={queue.retry}
        onCancel={queue.cancel}
        helperText='Nama file berisi "gagal" akan gagal diunggah'
      />
      <Button
        type="button"
        disabled={files.length === 0 || queue.isUploading}
        onClick={() =>
          queue
            .uploadAll()
            .then((done) => setResult(`Commit: ${done.map((d) => d.uploadId).join(", ")}`))
            .catch((e: Error) => setResult(`Gagal: ${e.message}`))
        }
      >
        Simpan
      </Button>
      {result && <p className="text-xs text-foreground/60">{result}</p>}
    </div>
  );
}

const meta = {
  title: "Hooks/Upload queue",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`useUploadQueue` (`@mono/hooks/upload`): presign (Server Action) → transfer straight to storage → commit the `uploadId`s in your submit handler. `onSelect` uploads as soon as a file is picked; `onSubmit` waits for `uploadAll()`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnSelect: Story = {
  name: "mode: onSelect",
  render: () => <QueueDemo mode="onSelect" />,
};
export const OnSubmit: Story = {
  name: "mode: onSubmit",
  render: () => <QueueDemo mode="onSubmit" />,
};

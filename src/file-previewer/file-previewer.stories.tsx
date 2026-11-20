import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { fn } from "storybook/test";

import { mobileStory } from "../../.storybook/docs/mobile";
import { Button } from "../ui/button.js";
import type { PreviewFile, PreviewFileGroup } from "./file-kind.js";
import { FilePreviewer, type FilePreviewerProps } from "./file-previewer.js";

/** A fresh client per story, so resolved URLs and errors are not cached across examples. */
function StoryQueryClient({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const withQueryClient: Decorator = (Story) => (
  <StoryQueryClient>
    <Story />
  </StoryQueryClient>
);

/** Docs: an open modal stays inside its own iframe instead of covering the docs page. */
const openInFrame = { docs: { story: { inline: false, iframeHeight: 720 } } };

// ---- Sample files: built in the browser, no network or auth needed. ----

function svgFile(id: string, name: string, title: string, fill: string): PreviewFile {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><rect width="960" height="640" fill="${fill}"/><path d="M0 520 L220 360 L380 450 L560 260 L760 400 L960 300 L960 640 L0 640 Z" fill="#00000022"/><rect x="40" y="40" width="360" height="72" rx="12" fill="#ffffffcc"/><text x="64" y="88" font-family="sans-serif" font-size="28" fill="#1e293b">${title}</text></svg>`;
  return {
    id,
    name,
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    mimeType: "image/svg+xml",
    size: svg.length,
  };
}

/** A one-page PDF with a few lines of text (Helvetica, ASCII only). */
function pdfFile(id: string, name: string, lines: string[]): PreviewFile {
  const content = lines
    .map((line, i) => `BT /F1 ${i === 0 ? 18 : 12} Tf 56 ${780 - i * 28} Td (${line}) Tj ET`)
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return {
    id,
    name,
    url: `data:application/pdf;base64,${btoa(pdf)}`,
    mimeType: "application/pdf",
    size: pdf.length,
  };
}

const PIT_MAP = svgFile("pit-map", "denah-pit-a.svg", "Denah Pit A - Site A", "#bae6fd");
const UNIT_PHOTO = svgFile("unit-photo", "foto-unit-hd-07.svg", "Unit HD-07 - Workshop", "#fde68a");
const FUEL_REPORT = pdfFile("fuel-report", "laporan-fuel-november.pdf", [
  "Laporan Fuel - November 2026",
  "Site: Site A",
  "Kontraktor: PT Bara",
  "Total fuel: 182.000 liter",
  "Produksi: 138.400 ton",
  "Fuel ratio: 1,32 L/ton",
]);
const STAKE_DATA: PreviewFile = {
  id: "stake-data",
  name: "data-patok.zip",
  url: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==",
  mimeType: "application/zip",
  size: 22,
};
const BROKEN_PHOTO: PreviewFile = {
  id: "broken",
  name: "foto-lokasi.jpg",
  url: "data:image/jpeg;base64,AAAA",
};

const GROUPS: PreviewFileGroup[] = [
  {
    id: "updated",
    label: "Diperbaharui",
    tone: "warning",
    timestamp: "20-11-2026, 08:14:10",
    note: "Perubahan: revisi denah dan laporan fuel",
    files: [PIT_MAP, FUEL_REPORT],
  },
  {
    id: "added",
    label: "Ditambahkan",
    tone: "success",
    timestamp: "18-11-2026, 15:02:44",
    files: [UNIT_PHOTO, STAKE_DATA],
  },
];

/** Controlled open state with a trigger, as a feature page would wire it. */
function PreviewerWithTrigger(args: FilePreviewerProps) {
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Lihat lampiran
      </Button>
      <FilePreviewer
        {...args}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          args.onOpenChange(next);
        }}
      />
    </>
  );
}

const meta = {
  title: "Components/FilePreviewer",
  component: FilePreviewer,
  decorators: [withQueryClient],
  parameters: {
    docs: {
      importPath:
        'import { FilePreviewer, getFileKind, downloadFile } from "@mono/ui/file-previewer";',
      description: {
        component: `Modal (bottom sheet on mobile) that previews attachments: images with zoom and pan (HEIC is converted on the fly outside Safari), PDFs page by page, and \`.docx\` documents; anything else gets a download prompt. With more than one file a list sits beside the preview (on mobile it is a separate step), optionally split into labelled \`groups\`. Every file can be opened in a new tab or downloaded, and "Unduh Semua" downloads them all. The PDF and Word viewers are code-split and load only when such a file is opened.

Needs a TanStack Query \`QueryClientProvider\` above it (used by \`resolveUrl\`).

### Helpers

- \`getFileKind({ name, url, mimeType })\` returns \`"image" | "pdf" | "docx" | "other"\`, from the MIME type first, then the extension of the name or the URL (query string ignored).
- \`downloadFile({ name, url })\` downloads through a blob, so it also works for cross-origin presigned URLs where \`<a download>\` is ignored; if fetching fails it opens the URL in a new tab.
- Also exported: \`isHeicFile\`, \`heicToObjectUrl\`, \`formatFileSize\` (e.g. \`2.4 MB\`), \`fetchBlob\`, \`openInNewTab\`, and the \`PreviewFile\` / \`PreviewFileGroup\` / \`FileKind\` types.`,
      },
    },
  },
  args: {
    open: false,
    onOpenChange: fn(),
    groups: GROUPS,
    title: "Lampiran izin kerja",
  },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
  },
} satisfies Meta<typeof FilePreviewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    return <PreviewerWithTrigger {...args} />;
  },
};

/** Open with grouped files; `initialFileId` picks the file shown first. */
export const Open: Story = {
  args: { open: true, initialFileId: FUEL_REPORT.id },
  parameters: openInFrame,
  render: function Render(args) {
    return <PreviewerWithTrigger {...args} />;
  },
};

/** A single file: no list and no "Unduh Semua"; the modal is narrower. */
export const SingleFile: Story = {
  args: { open: true, groups: undefined, files: [PIT_MAP], title: undefined },
  parameters: openInFrame,
  render: function Render(args) {
    return <PreviewerWithTrigger {...args} />;
  },
};

/** A file type it cannot show (here a zip) and an image that fails to load. */
export const UnsupportedAndBroken: Story = {
  args: { open: true, groups: undefined, files: [STAKE_DATA, BROKEN_PHOTO], title: undefined },
  parameters: openInFrame,
  render: function Render(args) {
    return <PreviewerWithTrigger {...args} />;
  },
};

/**
 * Files listed without a URL get one from `resolveUrl` when opened (e.g. presigned links that
 * expire). A skeleton shows while it loads; here it takes a second.
 */
export const ResolveUrl: Story = {
  args: {
    open: true,
    groups: undefined,
    files: [PIT_MAP, UNIT_PHOTO].map((file) => ({ ...file, url: "" })),
    resolveUrl: (file: PreviewFile) =>
      new Promise<string>((resolve) =>
        setTimeout(() => resolve([PIT_MAP, UNIT_PHOTO].find((f) => f.id === file.id)!.url), 1000)
      ),
  },
  parameters: openInFrame,
  render: function Render(args) {
    return <PreviewerWithTrigger {...args} />;
  },
};

/** When `resolveUrl` fails the pane offers a retry. */
export const ResolveUrlError: Story = {
  args: {
    open: true,
    groups: undefined,
    files: [{ ...FUEL_REPORT, url: "" }],
    title: undefined,
    resolveUrl: () => Promise.reject(new Error("Link kedaluwarsa")),
  },
  parameters: openInFrame,
  render: function Render(args) {
    return <PreviewerWithTrigger {...args} />;
  },
};

/** On a phone it is a full-height sheet; the file list and the preview are separate steps. */
export const Mobile: Story = {
  ...mobileStory,
  args: { open: true },
  render: function Render(args) {
    return <PreviewerWithTrigger {...args} />;
  },
};
